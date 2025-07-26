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
import { rmSync, createWriteStream, existsSync } from 'node:fs'; // file system
import { copyFile, readFile, writeFile, rename, readdir } from 'node:fs/promises'; // file system (Promise)
import { setTimeout } from 'node:timers/promises'; // wait for seconds
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from 'electron'; // electron
import ffmpeg from 'fluent-ffmpeg'; // ffmpeg
import iconv from 'iconv-lite'; // Text converter
import Encoding from 'encoding-japanese'; // for encoding
import { promisify } from 'util'; // promisify
import axios from 'axios'; // fot http communication
import * as stream from 'stream'; // steramer
import NodeCache from "node-cache"; // node-cache
import { Modifiy } from './class/ElTextModifiy0518'; // modifier
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
if (app.isPackaged) {
  globalRootPath = path.join(path.resolve(), 'resources');
} else {
  globalRootPath = path.join(__dirname, '..');
}

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
      //mainWindow.webContents.openDevTools();
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
    // get language
    const language = cacheMaker.get('language') ?? 'japanese';
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
    // make dir
    mkdirManager.mkDirAll(['output', 'logs']);
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
// extract
ipcMain.on('extract', async () => {
  try {
    logger.info('ipc: extract mode');
    // file list
    const files: string[] = await readdir('source/');

    // loop file
    await Promise.all(files.map((fl: string): Promise<void> => {
      return new Promise(async (resolve1, _) => {
        try {
          // file path
          const filePath: string = path.join(__dirname, 'source', fl);
          // read text
          const texts: string[] = await readdir(filePath);
          // loop line
          await Promise.all(texts.map((txt: string): Promise<void> => {
            return new Promise(async (resolve2, _) => {
              try {
                // extension
                const extension: string = path.extname(txt);
                // when txt
                if (extension == '.txt') {
                  // output path
                  const outPath: string = path.join(__dirname, 'extracted', texts[0]);
                  // copy
                  await copyFile(path.join(__dirname, 'source', fl, texts[0]), outPath);
                }
                // complete
                resolve2();

              } catch (err1: unknown) {
                logger.error(err1);
              }
            });
          }));
          // result
          resolve1();

        } catch (err2: unknown) {
          logger.error(err2);
        }
      })
    }));
    // complete
    logger.info('ipc: extract completed.');

  } catch (e: unknown) {
    logger.error(e);
  }
});

// modify
ipcMain.on('modify', async () => {
  try {
    logger.info('ipc: modify mode');
    // make directory
    await mkdirManager.mkDirAll(['txt', 'logs', 'modify']);
    // file list
    const files: string[] = await readdir('txt/');

    // loop for files
    await Promise.all(files.map((fl: string): Promise<void> => {
      return new Promise(async (resolve, _) => {
        try {
          let finalStr: any;
          // filepath
          const filePath: string = path.join(__dirname, 'txt', fl);
          // filepath completed
          const fileCompPath: string = path.join(__dirname, 'txt', 'complete', fl);
          // filepath output
          const outPath: string = path.join(__dirname, 'modify', fl);
          // read files
          const txtdata = await readFile(filePath);
          // detect charcode
          const detectedEncoding: string | boolean = Encoding.detect(txtdata);
          logger.debug('charcode: ' + detectedEncoding);
          // without string
          if (typeof (detectedEncoding) !== 'string') {
            throw new Error('error-encoding');
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
          if (typeof (removedStr1) == 'string') {
            logger.error('error1');
            finalStr = {
              header: '',
              body: removedStr0,
            }
          } else {
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

          // write out to file
          await writeFile(outPath, removedStr1.header + removedStr5);
          // move to complete dir
          await rename(filePath, fileCompPath);
          logger.info('writing finished.');
          // result
          resolve();

        } catch (err: unknown) {
          // error
          logger.error(err);
        }
      })
    }));
    // complete
    logger.info('ipc: modify completed');

  } catch (e: unknown) {
    // error
    logger.error(e);
  }
});


// record
ipcMain.on('record', async () => {
  try {
    logger.info('ipc: record started.');
    // make dir
    await mkdirManager.mkDirAll(['./txt', './tmp']);

    // subdir list
    const allDirents: any = await readdir('tmp/', { withFileTypes: true });
    const dirNames: any[] = allDirents.filter((dirent: any) => dirent.isDirectory()).map(({ name }: any) => name);

    if (dirNames) {
      // loop
      await Promise.all(dirNames.map(async (tmps: string): Promise<void> => {
        return new Promise(async (resolve0, reject0) => {
          try {
            // delete path
            const delFilePath: string = path.join('./tmp', tmps);
            logger.silly(`deleting ${tmps}`);
            // delete file
            rmSync(delFilePath, { recursive: true });
            resolve0();

          } catch (err: unknown) {
            // error
            logger.error(err);
            reject0();
          }
        });
      }));

    } else {
      logger.debug('record: no directory in /tmp.');
    }

    // file list
    const files: string[] = await readdir('txt/');

    // loop
    await Promise.all(files.map(async (fl: string): Promise<void> => {
      return new Promise(async (resolve1, reject1) => {
        try {
          logger.silly(`record: operating ${fl}`);
          // filename list
          let tmpFileNameArray: string[] = [];
          // filename
          const fileName: string = path.parse(fl).name;
          // ID
          const fileId: string = fileName.slice(0, 5);
          // save path
          const outDirPath: string = path.join('./tmp', fileId);
          // make dir
          if (!existsSync(outDirPath)) {
            await mkdirManager.mkDir(outDirPath);
            logger.silly(`record: finished making.. ${outDirPath}`);
          }
          // file path
          const filePath: string = path.join('./txt', fl);
          // file reading
          const txtdata: Buffer = await readFile(filePath);
          // decode
          const str: string = iconv.decode(txtdata, 'UTF8');
          logger.silly('record: char decoding finished.');
          // split on \r\n
          const strArray: string[] = str.split(/\r\n/);

          // loop
          await Promise.all(strArray.map(async (st: string, index: number): Promise<void> => {
            return new Promise(async (resolve2, reject2) => {
              try {
                // tmpfile
                let tmpFileName: string = '';

                // no text error
                if (st.trim().length == 0) {
                  throw new Error('err: no length');
                }
                logger.silly(`record: synthesizing .. ${st}`);
                // index
                const paddedIndex1: string = index.toString().padStart(3, '0');

                // over 500 char
                if (st.length > 500) {
                  // split on 。
                  const subStrArray: string[] = st.split(/。/);
                  // make audio
                  await Promise.all(subStrArray.map(async (sb: string, idx: number): Promise<void> => {
                    return new Promise(async (resolve3, reject3) => {
                      try {
                        // index
                        const paddedIndex2: string = idx.toString().padStart(3, '0');
                        logger.silly("record1: " + paddedIndex1);
                        logger.silly("record2: " + paddedIndex2);
                        // filename
                        tmpFileName = `${fileId}-${paddedIndex1}${paddedIndex2}.wav`;
                        // synthesis request
                        await synthesisRequest(tmpFileName, sb, outDirPath);
                        // add to filelist
                        tmpFileNameArray.push(tmpFileName);
                        // complete
                        resolve3();

                      } catch (err1: unknown) {
                        // error
                        logger.error(err1);
                        reject3();
                      }
                    })
                  }));

                } else {
                  // filename
                  tmpFileName = `${fileId}-${paddedIndex1}.wav`;
                  // synthesis request
                  await synthesisRequest(tmpFileName, st, outDirPath);
                  // add to list
                  tmpFileNameArray.push(tmpFileName);
                }
                logger.debug(`record: ${tmpFileName} finished.`);
                // complete
                resolve2();

              } catch (err2: unknown) {
                // error
                logger.error(err2);
                reject2();
              }
            });
          }));
          // complete
          resolve1();

        } catch (err3: unknown) {
          // error
          logger.error(err3);
          reject1();
        }
      });
    }));
    // complete
    logger.info('ipc: operation finished.');

  } catch (e: unknown) {
    // error
    logger.error(e);
  }
});

// finalize
ipcMain.on('finalize', async () => {
  try {
    logger.info('ipc: finalize mode');
    // make dir
    await mkdirManager.mkDirAll(['./download', './tmp', './backup']);

    // subdir list
    const allDirents: any = await readdir('tmp/', { withFileTypes: true });
    const dirNames: any[] = allDirents.filter((dirent: any) => dirent.isDirectory()).map(({ name }: any) => name);
    logger.debug(`finalize: filepaths are ${dirNames}`);

    // loop
    await Promise.all(dirNames.map(async (dir: any): Promise<void> => {
      return new Promise(async (resolve1, reject1) => {
        try {
          // target dir path
          const targetDir: string = path.join('./tmp', dir);
          // file list in subfolder
          const audioFiles: string[] = (await readdir(targetDir)).filter((ad: string) => path.parse(ad).ext == '.wav');

          // filepath list
          const filePaths: any[] = audioFiles.map((fl: string) => {
            return path.join('./tmp', dir, fl);
          });
          logger.silly(`finalize: files are ${filePaths}`);

          // DL path
          const downloadDir: string = './backup';
          // output path
          const outputPath: string = path.join('./download', `${dir}.wav`);

          logger.silly(`finalize: outputPath is ${outputPath}`);

          // ffmpeg
          let mergedVideo: any = ffmpeg();

          // merge
          await Promise.all(filePaths.map(async (path: string): Promise<void> => {
            return new Promise(async (resolve2, reject2) => {
              try {
                // merged video
                mergedVideo = mergedVideo.mergeAdd(path);
                logger.silly(`finalize: add to mergelist ${path}...`);
                // complete
                resolve2();

              } catch (err1: unknown) {
                // error
                logger.error(err1);
                reject2();
              }
            });
          }));

          logger.info('finalize: merging files...');
          // merge
          mergedVideo.mergeToFile(outputPath, downloadDir)
            .on('error', (err2: unknown) => {
              // error
              logger.error(err2);
              reject1();
            })
            .on('end', function () {
              logger.debug(`finalize: ${dir}.wav  merge finished.`);
              // result
              resolve1();
            });

        } catch (error: unknown) {
          // error
          logger.error(error);
          reject1();
        }
      });
    })).then(() => logger.info('ipc: operation finished.'));

  } catch (e: unknown) {
    logger.error(e);
  }
});

// rename
ipcMain.on('rename', async () => {
  try {
    logger.info('ipc: rename mode');
    // make directory
    await mkdirManager.mkDirAll(['txt', 'logs']);
    // file list
    const files: string[] = await readdir('txt/');

    // promise
    await Promise.all(files.map((fl: string, idx: number): Promise<void> => {
      return new Promise(async (resolve1, _) => {
        try {
          // file name
          let newFileName: string = '';
          // file path
          const filePath: string = path.join(__dirname, 'txt', fl);
          // renamed path
          const renamePath: string = path.join(__dirname, 'renamed');
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

  } catch (e: unknown) {
    logger.error(e);
  }
});

// exit
ipcMain.on('exit', async () => {
  try {
    logger.info('ipc: exit mode');
    // selection
    const selected: number = dialogMaker.showQuetion('question', 'exit', 'exit? data is exposed');

    // when yes
    if (selected == 0) {
      // close
      app.quit();
    }

  } catch (e: unknown) {
    logger.error(e);
  }
});

/*
 Functions
*/
// synthesis audio
const synthesisRequest = async (filename: string, text: string, outDir: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.debug(`${filename} started.`);
      // pipe
      const finished = promisify(stream.finished);
      // parameter
      const params: any = {
        text: text,
        encoding: 'utf-8',
        model_id: 0,
        speaker_id: 0,
        peaker_name: 'bratology',
        sdp_ratio: 0.2,
        noise: 0.6,
        noisew: 0.8,
        length: 1.1,
        language: 'JP',
        auto_split: true,
        split_interval: 2,
        assist_text_weight: 1.0,
        style: 'Neutral',
        style_weight: 5.0,
        // reference_audio_path: '',
      }
      // query
      const query: any = new URLSearchParams(params);
      // requestURL
      const tmpUrl: string = `http://${myConst.HOSTNAME}:${myNums.PORT}/voice?${query}`;
      // file path
      const filePath: string = path.join(outDir, filename);
      // file writer
      const writer = createWriteStream(filePath);
      // GET request
      await axios({
        method: 'get',
        url: tmpUrl,
        responseType: 'stream',

      }).then(async (response: any) => {
        await response.data.pipe(writer);
        await finished(writer);
        logger.debug('synthesisRequest end');
        resolve(filePath); //this is a Promise
      });

    } catch (e: unknown) {
      // error
      logger.error(e);
      reject('error');
    }
  });
}