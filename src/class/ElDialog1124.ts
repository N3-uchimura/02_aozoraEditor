/**
 * ElDialog.ts
 *
 * name：ElDialog
 * function：Dialog operation for electron
 * updated: 2025/11/24
 **/

'use strict';

/// import modules
import { dialog } from 'electron'; // electron
import { FileFilter } from 'electron/main'; // file filter

// file dialog option
interface fileDialog {
  properties: any; // file open
  title: string; // header title
  defaultPath: string; // default path
  filters: FileFilter[]; // filter
}

// ElectronDialog class
class Dialog {
  static logger: any; // static logger

  // construnctor
  constructor(logger: any) {
    // logger setting
    Dialog.logger = logger;
    Dialog.logger.debug('dialog: initialize mode');
  }

  /// show question
  // show yes/no
  showQuetion(title: string, message: string, detail: string): number {
    try {
      Dialog.logger.debug('dialog: showQuetion started.');
      // quetion message option
      const options: Electron.MessageBoxSyncOptions = {
        type: 'question',
        title: title,
        message: message,
        detail: detail,
        buttons: ['yes', 'no'],
        cancelId: -1 // Esc
      };
      // selected number
      const selected: number = dialog.showMessageBoxSync(options);
      Dialog.logger.debug('dialog: showQuetion finished.');
      // return selected
      return selected;
    } catch (e) {
      // error
      Dialog.logger.error(e);
      return 99;
    }
  }

  // show message
  showmessage(type: string, message: string) {
    try {
      Dialog.logger.debug('dialog: showmessage started.');
      // mode
      let tmpType:
        | 'none'
        | 'info'
        | 'error'
        | 'question'
        | 'warning'
        | undefined;
      // title
      let tmpTitle: string | undefined;

      // url
      switch (type) {
        // info mode
        case 'info':
          tmpType = 'info';
          tmpTitle = 'info';
          break;

        // error mode
        case 'error':
          tmpType = 'error';
          tmpTitle = 'error';
          break;

        // warning mode
        case 'warning':
          tmpType = 'warning';
          tmpTitle = 'warning';
          break;

        // others
        default:
          tmpType = 'none';
          tmpTitle = '';
      }

      // options
      const options: Electron.MessageBoxOptions = {
        type: tmpType, // type
        message: tmpTitle, // title
        detail: message // description
      };
      // show dialog
      dialog.showMessageBox(options);
      Dialog.logger.debug('dialog: showmessage finished.');
    } catch (e) {
      Dialog.logger.error(e);
    }
  }

  // show file dialog
  showFileDialog = async (mainWindow: any, target: string[], title: string, name: string, extensions: string[]): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        Dialog.logger.info('dialog: showFileDialog mode');
        // options
        const dialogOptions: fileDialog = {
          properties: target, // file open
          title: title, // header title
          defaultPath: '.', // default path
          filters: [
            { name: name, extensions: extensions } // filter
          ]
        };
        // show file dialog
        dialog
          .showOpenDialog(mainWindow, dialogOptions)
          .then((result: any) => {
            // file exists
            if (result.filePaths.length > 0) {
              // resolved
              resolve(result.filePaths[0]);

              // no file
            } else {
              // rejected
              reject(result.canceled);
            }
          })
          .catch((err: unknown) => {
            // error
            Dialog.logger.error(err);
            // rejected
            reject('error');
          });
      } catch (e: unknown) {
        // error
        Dialog.logger.error(e);
        // error type
        if (e instanceof Error) {
          reject('error');
        }
      }
    });
  }
}

// export module
export default Dialog;
