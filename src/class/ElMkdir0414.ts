/**
 * ELMkdir.ts
 *
 * name：ELMkdir
 * function：Mkdir operation for electron
 * updated: 2025/04/14
 **/

'use strict';

// define modules
import { promises, existsSync } from 'node:fs'; // file system
// file system definition
const { mkdir } = promises;

// Mkdir class
class Mkdir {
  static logger: any; // static logger

  // construnctor
  constructor(logger: any) {
    // logger setting
    Mkdir.logger = logger;
    Mkdir.logger.debug('mkdir: mkdir initialized.');
  }

  // mkDir
  mkDir = async (dir: string): Promise<void> => {
    return new Promise(async (resolve, _) => {
      try {
        Mkdir.logger.debug('mkdir: mkdir started.');
        // not exists
        if (!existsSync(dir)) {
          // make dir
          await mkdir(dir);

          Mkdir.logger.debug('mkdir: mkdir completed.');
        } else {
          Mkdir.logger.debug('already exists.');
        }
        resolve();
      } catch (err: unknown) {
        // error
        Mkdir.logger.error(err);
        resolve();
      }
    });
  };

  // mkDirAll
  mkDirAll = async (dirs: string[]): Promise<void> => {
    return new Promise(async (resolve1, _) => {
      try {
        Mkdir.logger.debug('mkdir: all mkdir started.');
        // make all dir
        Promise.all(
          dirs.map(async (dir: string): Promise<void> => {
            return new Promise(async (resolve2, _) => {
              try {
                // not exists
                if (!existsSync(dir)) {
                  // make dir
                  await mkdir(dir);
                  resolve2();
                } else {
                  // error
                  throw Error('already exists.');
                }
              } catch (err: unknown) {
                // error
                resolve2();
              }
            });
          })
        ).then(() => resolve1());
        Mkdir.logger.debug('mkdir: mkDirAll started.');

        // make dir
      } catch (e: unknown) {
        // error
        Mkdir.logger(e);
        resolve1();
      }
    });
  };
}

// export module
export default Mkdir;
