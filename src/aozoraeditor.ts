/*
 * aozoraeditor.ts
 *
 * aozoraeditor - aozora edit tools -
 **/

'use strict';

/// Constants
// namespace
import { myConst, myNums } from './consts/globalvariables';

/// Modules
import * as path from 'node:path'; // path
import { existsSync } from 'node:fs'; // file system
import { unlink, copyFile, readFile, writeFile, rename, readdir } from 'node:fs/promises'; // file system (Promise)
import { setTimeout } from 'node:timers/promises'; // wait for seconds
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from 'electron'; // electron
import iconv from 'iconv-lite'; // Text converter
import extract from 'extract-zip'; // extract zip file
import Encoding from 'encoding-japanese'; // for encoding
import NodeCache from "node-cache"; // node-cache
import { Modifiy } from './class/ElTextModifiy0813'; // modifier
import ELLogger from './class/ElLogger'; // logger
import Dialog from './class/ElDialog0721'; // dialog
import MKDir from './class/ElMkdir0414'; // mdkir

// log level
const LOG_LEVEL: string = myConst.LOG_LEVEL ?? 'all';
// loggeer instance
const logger: ELLogger = new ELLogger(myConst.COMPANY_NAME, myConst.APP_NAME, LOG_LEVEL);
// dialog instance
const dialogMaker: Dialog = new Dialog(logger);
// mkdir instance
const mkdirManager = new MKDir(logger);
// modify instance
const modifyMaker: Modifiy = new Modifiy(logger);
// cache instance
const cacheMaker: NodeCache = new NodeCache();

/// interfaces
// window option
interface windowOption {
  width: number; // window width
  height: number; // window height
  defaultEncoding: string; // default encode
  webPreferences: Object; // node
}

/*
 main
*/
// main window
let mainWindow: Electron.BrowserWindow;
// quit flg
let isQuiting: boolean;
// global path
let globalRootPath: string;

// set rootpath
if (!myConst.DEVMODE) {
  globalRootPath = path.join(path.resolve(), 'resources');
} else {
  globalRootPath = path.join(__dirname, '..');
}
// make file dir
const baseFilePath: string = path.join(globalRootPath, 'file');

// create main window
const createWindow = (): void => {
  try {
    // window options
    const windowOptions: windowOption = {
      width: myNums.WINDOW_WIDTH, // window width
      height: myNums.WINDOW_HEIGHT, // window height
      defaultEncoding: myConst.DEFAULT_ENCODING, // encoding
      webPreferences: {
        nodeIntegration: false, // node
        contextIsolation: true, // isolate
        preload: path.join(__dirname, "preload.js"), // preload
      }
    }
    // Electron window
    mainWindow = new BrowserWindow(windowOptions);
    // hide menubar
    mainWindow.setMenuBarVisibility(false);
    // index.html load
    mainWindow.loadFile(path.join(globalRootPath, 'www', 'index.html'));
    // ready
    mainWindow.once('ready-to-show', () => {
      // dev mode
      if (!app.isPackaged) {
        //mainWindow.webContents.openDevTools();
      }
    });

    // stay at tray
    mainWindow.on('minimize', (event: any): void => {
      // avoid Wclick
      event.preventDefault();
      // hide window
      mainWindow.hide();
      // returnfalse
      event.returnValue = false;
    });

    // close window
    mainWindow.on('close', (event: any): void => {
      // not closing
      if (!isQuiting && process.platform !== 'darwin') {
        // quit
        app.quit();
        // return false
        event.returnValue = false;
      }
    });

    // closing
    mainWindow.on('closed', (): void => {
      // destroy window
      mainWindow.destroy();
    });

  } catch (e: unknown) {
    logger.error(e);
  }
}

// enable sandbox
app.enableSandbox();

// main app
app.on('ready', async () => {
  try {
    logger.info('app: electron is ready');
    // create window
    createWindow();
    // menu label
    let displayLabel: string = '';
    // close label
    let closeLabel: string = '';
    // txt path
    const languageTxtPath: string = path.join(globalRootPath, 'assets', 'language.txt');
    // not exists
    if (!existsSync(languageTxtPath)) {
      logger.debug('app: making txt ...');
      // make txt file
      await writeFile(languageTxtPath, 'japanese');
    }
    // get language
    const language = await readFile(languageTxtPath, 'utf8');
    logger.debug(`language is ${language}`);
    // japanese
    if (language == 'japanese') {
      // set menu label
      displayLabel = '表示';
      // set close label
      closeLabel = '閉じる';
    } else {
      // set menu label
      displayLabel = 'show';
      // set close label
      closeLabel = 'close';
    }
    // cache
    cacheMaker.set('language', language);

    // make dir
    await mkdirManager.mkDir(baseFilePath);
    await mkdirManager.mkDirAll([path.join(baseFilePath, 'source'), path.join(baseFilePath, 'tmp'), path.join(baseFilePath, 'renamed'), path.join(baseFilePath, 'modified'), path.join(baseFilePath, 'extracted')]);
    // icons
    const icon: Electron.NativeImage = nativeImage.createFromPath(path.join(globalRootPath, 'assets', 'aozora.ico'));
    // tray
    const mainTray: Electron.Tray = new Tray(icon);
    // context menu
    const contextMenu: Electron.Menu = Menu.buildFromTemplate([
      // show
      {
        label: displayLabel,
        click: () => {
          mainWindow.show();
        }
      },
      // close
      {
        label: closeLabel,
        click: () => {
          app.quit();
        }
      }
    ]);
    // context menu
    mainTray.setContextMenu(contextMenu);
    // Wclick reopen
    mainTray.on('double-click', () => mainWindow.show());

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// activate
app.on('activate', () => {
  // no window
  if (BrowserWindow.getAllWindows().length === 0) {
    // reload
    createWindow();
  }
});

// close
app.on('before-quit', () => {
  // turn on close flg
  isQuiting = true;
});

// end
app.on('window-all-closed', () => {
  logger.info('app: close app');
  // exit
  app.quit();
});

/*
 IPC
*/
// ready
ipcMain.on("beforeready", async (event: any, __) => {
  logger.info("app: beforeready app");
  // language
  const language = cacheMaker.get('language') ?? '';
  // be ready
  event.sender.send("ready", language);
});

// extract
ipcMain.on('extract', async () => {
  try {
    logger.info('ipc: extract mode');
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // zip file list
    const zipFiles: string[] = await readdir(path.join(baseFilePath, 'source'));
    // if empty
    if (zipFiles.length == 0) {
      // japanese
      if (language == 'japanese') {
        throw new Error('対象のzipファイルが空です（file/source）。');
      } else {
        throw new Error('file/source directory is empty');
      }
    }
    logger.debug('extract: zip exists');

    // txtfile list
    const tmpTxtFiles: string[] = await readdir(path.join(baseFilePath, 'tmp'));
    // delete all files
    await Promise.all(tmpTxtFiles.map((fl: string): Promise<void> => {
      return new Promise(async (resolve, _) => {
        try {
          // txt file path
          const targetPath: string = path.join(globalRootPath, path.join(baseFilePath, 'tmp'), fl);
          await unlink(targetPath);
          // result
          resolve();

        } catch (err2: unknown) {
          logger.error(err2);
        }
      })
    }));
    // complete
    logger.debug('ipc: delete tmp files completed.');

    // extract files
    await Promise.all(zipFiles.map((fl: string): Promise<void> => {
      return new Promise(async (resolve, _) => {
        try {
          // zip file path
          const zipPath: string = path.join(globalRootPath, path.join(baseFilePath, 'source'), fl);
          // txt file path
          const targetPath: string = path.join(globalRootPath, path.join(baseFilePath, 'tmp'));
          await extract(zipPath, { dir: targetPath });
          resolve();

        } catch (err: unknown) {
          logger.error(err);
        }
      })
    }));
    logger.debug('extract: all zip extracted');

    // txtfile list
    const txtFiles: string[] = await readdir(path.join(baseFilePath, 'tmp'));
    // loop file
    await Promise.all(txtFiles.map((fl: string): Promise<void> => {
      return new Promise(async (resolve, _) => {
        try {
          // file path
          const filePath: string = path.join(baseFilePath, 'tmp', fl);
          // file name
          const filename: string = path.basename(filePath)
          // extension
          const extension: string = path.extname(filePath);
          // when txt
          if (extension == '.txt') {
            // output path
            const outPath: string = path.join(baseFilePath, 'extracted', filename);
            // not exists
            if (!existsSync(outPath)) {
              // copy
              await copyFile(filePath, outPath,);
            }
          }
          // complete
          resolve();

        } catch (err: unknown) {
          logger.error(err);
        }
      });
    }));
    // complete
    logger.info('ipc: extract completed.');
    dialogMaker.showmessage('info', 'extract completed.');

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// modify
ipcMain.on('modify', async () => {
  try {
    logger.info('ipc: modify mode');
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // file list
    const files: string[] = await readdir(path.join(baseFilePath, 'extracted'));
    // if empty
    if (files.length == 0) {
      // japanese
      if (language == 'japanese') {
        throw new Error('対象のファイルが空です（file/extracted');
      } else {
        throw new Error('file/extracted directory is empty');
      }
    }
    logger.debug('modify: txt exists');

    // loop for files
    await Promise.all(files.map((fl: string): Promise<void> => {
      return new Promise(async (resolve, _) => {
        try {
          let finalStr: any;
          // filepath
          const filePath: string = path.join(baseFilePath, 'extracted', fl);

          // not exists
          if (existsSync(filePath)) {
            // read files
            const txtdata = await readFile(filePath);
            // detect charcode
            const detectedEncoding: string | boolean = Encoding.detect(txtdata);
            logger.debug('charcode: ' + detectedEncoding);
            // without string
            if (typeof (detectedEncoding) !== 'string') {
              // japanese
              if (language == 'japanese') {
                throw new Error('エンコーディングエラー');
              } else {
                throw new Error('error-encoding');
              }
            }
            // decode
            const str = iconv.decode(txtdata, detectedEncoding);
            logger.debug('char decoding finished.');
            // repeat strings
            const removedStr0: string = await modifyMaker.repeatCharacter(str);
            if (removedStr0 == 'error') {
              logger.error('0: none');
            }
            logger.debug('0: finished');
            // annotations
            const removedStr1: any = await modifyMaker.removeAnnotation(removedStr0);
            // check type
            if (typeof (removedStr1) == 'string') {
              logger.debug('string');
              finalStr = {
                header: '',
                body: removedStr0,
              }
            } else {
              logger.debug('not string');
              finalStr = removedStr1;
            }
            logger.debug('1: finished');
            // remove footer
            const removedStr2: string = await modifyMaker.removeFooter(finalStr.body);
            if (removedStr2 == 'error') {
              logger.error('error2');
            }
            logger.debug('2: finished');
            // remove ryby(《》)
            const removedStr3: string = await modifyMaker.removeRuby(removedStr2);
            if (removedStr3 == 'error') {
              logger.error('error3');
            }
            logger.debug('3: finished');
            // remove angle bracket([])
            const removedStr4: string = await modifyMaker.removeBrackets(removedStr3);
            if (removedStr4 == 'error') {
              logger.error('error4');
            }
            logger.debug('4: finished');
            // remove unnecessary string
            const removedStr5: string = await modifyMaker.removeSymbols(removedStr4);
            if (removedStr5 == 'error') {
              logger.error('error5');
            }
            logger.debug('5: finished');

            // exchange old to new
            const removedStr6: string = await modifyMaker.exchangeOld(removedStr5);
            if (removedStr6 == 'error') {
              logger.error('error6');
            }
            logger.debug('6: finished');
            // filepath output
            const outPath: string = path.join(baseFilePath, 'modified', fl);
            // write out to file
            await writeFile(outPath, removedStr1.header + removedStr6);
          }
          logger.info('writing finished.');
          resolve();

        } catch (err: unknown) {
          // error
          logger.error(err);
        }
      })
    }));
    // complete
    logger.info('ipc: modify completed');
    dialogMaker.showmessage('info', 'modify completed.');

  } catch (e: unknown) {
    // error
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// rename
ipcMain.on('rename', async () => {
  try {
    logger.info('ipc: rename mode');
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // file list
    const files: string[] = await readdir(path.join(baseFilePath, 'modified'));
    // if empty
    if (files.length == 0) {
      // japanese
      if (language == 'japanese') {
        throw new Error('対象が空です（file/modified');
      } else {
        throw new Error('file/modified directory is empty');
      }
    }
    // promise
    await Promise.all(files.map((fl: string, idx: number): Promise<void> => {
      return new Promise(async (resolve1, _) => {
        try {
          // file name
          let newFileName: string = '';
          // file path
          const filePath: string = path.join(baseFilePath, 'modified', fl);
          // renamed path
          const renamePath: string = path.join(baseFilePath, 'renamed');
          // file reading
          const txtdata: Buffer = await readFile(filePath);
          // char encode
          const detectedEncoding: string | boolean = Encoding.detect(txtdata);
          logger.silly('rename: ' + detectedEncoding);
          // if not string
          if (typeof (detectedEncoding) !== 'string') {
            throw new Error('error-encoding');
          }
          // char decode
          const str: string = iconv.decode(txtdata, detectedEncoding);
          logger.silly('rename: char decoding finished.');
          // wait for 1sec
          await setTimeout(1000);
          // split on \r\n
          const strArray: string[] = str.split(/\r\n/);
          // title
          const titleStr: string = strArray[0];
          // subtitle
          const subTitleStr: string = strArray[1];
          // author
          const authorStr: string = strArray[2];
          // index
          const paddedIndex: string = (idx + 8189).toString().padStart(5, '0');

          if (!authorStr) {
            // filename
            newFileName = path.join(renamePath, `${paddedIndex}_${titleStr}_${subTitleStr}.txt`);

          } else {
            // filename
            newFileName = path.join(renamePath, `${paddedIndex}_${titleStr}_${subTitleStr}_${authorStr}.txt`);
          }

          // prohibit symbol
          const notSymbol: string[] = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];

          // tmp
          let tmpStr: string = '';

          // loop
          await Promise.all(notSymbol.map((symb: string): Promise<void> => {
            return new Promise(async (resolve2, _) => {
              try {
                // tmp
                tmpStr = newFileName;

                // include symbol
                if (newFileName.includes(symb)) {
                  tmpStr = tmpStr.replace(symb, '');
                }
                // result
                resolve2();

              } catch (error: unknown) {
                logger.error(error);
              }
            });
          }));

          if (tmpStr.length < 255) {
            // rename
            await rename(filePath, tmpStr);
            // wait for 1sec
            await setTimeout(1000);

            // result
            resolve1();
          }

        } catch (err: unknown) {
          logger.error(err);
        }
      });
    }));
    // result
    logger.info('ipc rename finished.');
    // end message
    dialogMaker.showmessage('info', 'rename completed.');

  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// config
ipcMain.on('config', async (event: any, _) => {
  try {
    logger.info('app: config app');
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // goto config page
    await mainWindow.loadFile(path.join(globalRootPath, 'www', 'config.html'));
    // language
    event.sender.send('confready', language);
  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// save
ipcMain.on('save', async (event: any, arg: any) => {
  try {
    logger.info('app: save config');
    // language
    const language: string = String(arg.language);
    // txt path
    const languageTxtPath: string = path.join(globalRootPath, "assets", "language.txt");
    // make txt file
    await writeFile(languageTxtPath, language);
    // cache
    cacheMaker.set('language', language);
    // goto config page
    await mainWindow.loadFile(path.join(globalRootPath, 'www', 'index.html'));
    // language
    event.sender.send('ready', language);
  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

ipcMain.on('top', async (event: any, _) => {
  try {
    logger.info('app: top');
    // goto config page
    await mainWindow.loadFile(path.join(globalRootPath, 'www', 'index.html'));
    // language
    const language = cacheMaker.get('language') ?? '';
    // language
    event.sender.send('ready', language);
  } catch (e: unknown) {
    logger.error(e);
    // error
    if (e instanceof Error) {
      // error message
      dialogMaker.showmessage('error', e.message);
    }
  }
});

// exit
ipcMain.on('exit', async () => {
  try {
    logger.info('ipc: exit mode');
    // title
    let questionTitle: string = '';
    // message
    let questionMessage: string = '';
    // language
    const language = cacheMaker.get('language') ?? 'japanese';
    // japanese
    if (language == 'japanese') {
      questionTitle = '終了';
      questionMessage = '終了していいですか';
    } else {
      questionTitle = 'exit';
      questionMessage = 'exit?';
    }
    // selection
    const selected: number = dialogMaker.showQuetion('question', questionTitle, questionMessage);

    // when yes
    if (selected == 0) {
      // close
      app.quit();
    }

  } catch (e: unknown) {
    logger.error(e);
  }
});
