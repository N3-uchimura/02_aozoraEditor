/**
 * ElCsv.ts
 *
 * name：ElCsv
 * function：CSV operation for electron
 * updated: 2025/04/14
 **/

'use strict';

// define modules
import { readFile, writeFile } from 'node:fs/promises'; // file system
import { dialog } from 'electron'; // electron
import { FileFilter } from 'electron/main'; // file filter
import { parse } from 'csv-parse/sync'; // csv parser
import { stringify } from 'csv-stringify/sync'; // csv stringify
import iconv from 'iconv-lite'; // encoding

// csv dialog option
interface csvDialog {
  properties: any; // file open
  title: string; // header title
  defaultPath: string; // default path
  filters: FileFilter[]; // filter
}

// CSV class
class CSV {
  static logger: any; // static logger
  static defaultencoding: string; // defaultencoding

  // construnctor
  constructor(encoding: string, logger: any) {
    // DB config
    CSV.defaultencoding = encoding;
    // logger setting
    CSV.logger = logger;
    CSV.logger.info('csv: initialize mode');
  }

  // getCsvData
  getCsvData = async (filenames: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        CSV.logger.info('csv: getCsvData mode');
        // filename exists
        if (filenames.length) {
          // read file
          const data: any = await readFile(filenames[0]);
          // encoding
          const str: string = iconv.decode(data, CSV.defaultencoding);
          // csv parse
          const tmpRecords: any = parse(str, {
            columns: false, // no column
            from_line: 2, // ignore first line
            skip_empty_lines: true // ignore empty cell
          });
          console.log(tmpRecords);
          CSV.logger.info('csv: getCsvData finished');
          // resolve
          resolve({
            record: tmpRecords, // dataa
            filename: filenames[0] // filename
          });
        } else {
          // nofile, exit
          reject();
        }
      } catch (e) {
        // error
        console.log(e);
        reject();
      }
    });
  };

  // makeCsvData
  makeCsvData = async (
    arr: any[],
    columns: string[],
    filename: string
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        CSV.logger.info('csv: makeCsvData mode');
        // csvdata
        const csvData: any = stringify(arr, { header: true, columns: columns });
        // write to csv file
        await writeFile(filename, iconv.encode(csvData, 'shift_jis'));
        // complete
        resolve();
      } catch (e) {
        // error
        console.log(e);
        reject();
      }
    });
  };

  // showCSVDialog
  showCSVDialog = async (mainWindow: any): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        CSV.logger.info('csv: showCSVDialog mode');
        // options
        const dialogOptions: csvDialog = {
          properties: ['openFile'], // file open
          title: 'choose csv file', // header title
          defaultPath: '.', // default path
          filters: [
            { name: 'csv(Shif-JIS)', extensions: ['csv'] } // filter
          ]
        };
        // show file dialog
        dialog
          .showOpenDialog(mainWindow, dialogOptions)
          .then((result: any) => {
            // file exists
            if (result.filePaths.length > 0) {
              // resolved
              resolve(result.filePaths);

              // no file
            } else {
              // rejected
              reject(result.canceled);
            }
          })
          .catch((err: unknown) => {
            // error
            console.log(err);
            // rejected
            reject('error');
          });
      } catch (e) {
        // error
        console.log(e);
        // error type
        if (e instanceof Error) {
          reject('error');
        }
      }
    });
  };
}

// export module
export default CSV;
