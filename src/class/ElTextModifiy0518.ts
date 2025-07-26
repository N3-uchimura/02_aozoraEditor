/**
 * ElTextModifiy.ts
 *
 * ElTextModifiy
 * function：text modifier
 * updated: 2025/05/18
 **/

'use strict';

// define modules
import { toDakuon } from 'kanadaku';

//* Interfaces
interface removed {
  header: string;
  body: string;
}

// class
export class Modifiy {
  static logger: any; // logger

  // constractor
  constructor(logger: any) {
    // loggeer instance
    Modifiy.logger = logger;
    Modifiy.logger.debug('modify: constructed');
  }

  // initialize
  init(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject();
      }
    });
  }

  // remove annotation
  removeAnnotation(str: string): Promise<removed | string> {
    return new Promise(async (resolve, reject) => {
      try {
        // annotation distinction
        const annotation: string = '-------------------------------------------------------';

        // remove
        if (str.includes(annotation)) {
          // split
          const result: string[] = str.split(annotation);
          // complete
          resolve({
            header: result[0],
            body: str.split(annotation)[2],
          });
        }

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject('error');
      }
    });
  }

  // remove footer annotation
  removeFooter(str: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // distinction
        const annotation: string = '底本：';
        // remove footer
        if (str.includes(annotation)) {
          // split
          const result: string[] = str.split(annotation);
          // result
          resolve(result[0]);
        }

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject('error');
      }
    });
  }

  // emove ruby(《》)
  removeRuby(str: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // result
        resolve(str.replace(/《.+?》/g, ''));

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject('error');
      }
    });
  }

  // remove brackets([])
  removeBrackets(str: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        // result
        resolve(str.replace(/《.+?》/g, ''));

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject('error');
      }
    });
  }

  // remove repeat signs
  repeatCharacter(str: string): Promise<string> {
    return new Promise(async (resolve1, reject1) => {
      try {
        // tmp
        let tmpStr: string = str;
        // remove repeat signs
        const shortSymbols: string[] = ['ゝ', 'ゞ', '／＼', '／″＼'];

        // promise
        await Promise.all(shortSymbols.map(async (smb: string): Promise<void> => {
          return new Promise(async (resolve2, reject2) => {
            try {
              // str length
              let strLen: number = 0;
              // matched
              let matchedStr: string = '';

              // if include
              if (tmpStr.includes(smb)) {

                // when voiced
                if (smb == '／″＼') {
                  // str length
                  strLen = 2;

                } else {
                  // str length
                  strLen = smb.length;
                }

                // str length is over 2
                if (strLen > 1) {
                  matchedStr = '.{2}';

                } else {
                  matchedStr = '.';
                }

                // regexp
                const regex: RegExp = new RegExp(matchedStr + smb, 'g');
                // match part
                const match = tmpStr.match(regex);

                // if match
                if (match) {
                  // promise
                  await Promise.all(match.map(async (mp: string): Promise<void> => {
                    return new Promise(async (resolve3, reject3) => {
                      try {
                        // just before
                        let previousChar = '';
                        // matched char
                        let hitChar = '';

                        // voiced
                        if (smb == '／″＼') {
                          // just before
                          previousChar = toDakuon(mp.substring(0, strLen));
                          // matched char
                          hitChar = mp.substring(strLen, strLen * 2 + 1);

                        } else {
                          // just before
                          previousChar = mp.substring(0, strLen);
                          // matched char
                          hitChar = mp.substring(strLen, strLen * 2);
                        }
                        // replace
                        const replaced: string = mp.replace(hitChar, previousChar);
                        // replaced string
                        tmpStr = tmpStr.replace(mp, replaced);

                        // result
                        resolve3();

                      } catch (err1: unknown) {
                        if (err1 instanceof Error) {
                          Modifiy.logger.error(err1.message);
                          // error
                          reject3();
                        }
                      }
                    });
                  }));

                } else {
                  Modifiy.logger.error('not found');
                }
              }
              // result
              resolve2();

            } catch (err2: unknown) {
              if (err2 instanceof Error) {
                Modifiy.logger.error(err2.message);
                // error
                reject2();
              }
            }
          });
        }));
        // result
        resolve1(tmpStr);

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject1('error');
      }
    });
  }

  // remove symbols
  removeSymbols(str: string): Promise<string> {
    return new Promise(async (resolve1, reject1) => {
      try {
        // tmp
        let tmpStr: string = str;
        // symbols
        const symbols: string[] = ['｜', '――'];
        // removal
        await Promise.all(symbols.map((syb: string): Promise<void> => {
          return new Promise(async (resolve2, reject2) => {
            try {
              // regexp
              const regStr: RegExp = new RegExp(syb, 'g');
              // replaced
              tmpStr = tmpStr.replace(regStr, '');
              // result
              resolve2();

            } catch (err: unknown) {
              if (err instanceof Error) {
                Modifiy.logger.error(err.message);
                // error
                reject2();
              }
            }
          })
        }));
        // result
        resolve1(tmpStr);

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject1('error');
      }
    });
  }
}
