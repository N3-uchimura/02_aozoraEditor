/**
 * ElTextModifiy.ts
 *
 * ElTextModifiy
 * function：text modifier
 * updated: 2025/10/05
 **/

'use strict';

// define modules
import { toDakuon } from 'kanadaku';
import { jionArray } from '../lib/dic-jion';
import { kanaArray } from '../lib/dic-kana';
import { kanjiArray } from '../lib/dic-kanji';
import { smallArray } from '../lib/dic-small';

// global variables
const ARRAY_LENGTH: number = 30;
const LINE_LENGTH: number = 30;

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

  // get partial line
  getPartialLine(str: string, mode: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        Modifiy.logger.silly(`modify: get partial line on ${mode} mode`);
        // start flg
        let startFlg: boolean = false;
        // second flg
        let secondFlg: boolean = false;
        // third flg
        let thirdFlg: boolean = false;
        // tmp str
        let tmpStr: string = '';
        // split
        const result: string[] = str.split(/\r\n|\n|\r/);
        // target array
        const targetArray: string[] = result.slice(0, ARRAY_LENGTH);
        // loop
        for (let i = 0; i < targetArray.length; i++) {
          // empty line
          if (targetArray[i] == '') {
            startFlg = true;
          } else {
            // third one
            if (thirdFlg) {
              // set text
              tmpStr = targetArray[i].slice(0, LINE_LENGTH);
              break;
            }
            // second one
            if (secondFlg) {
              // second mode
              if (mode == 2) {
                // set text
                tmpStr = targetArray[i].slice(0, LINE_LENGTH);
                break;
                // third mode
              } else if (mode == 3) {
                thirdFlg = true;
                // goto next
                continue;
              } else {
                // error
                Modifiy.logger.error('error');
                break;
              }
            }
            // start line
            if (startFlg) {
              // mode
              if (mode == 0) {
                // set text
                tmpStr = targetArray[i].slice(0, LINE_LENGTH);
                break;
              } else if (mode == 1) {
                // under 5 chara
                if (targetArray[i].length < 5) {
                  // goto next
                  continue;
                } else {
                  // set text
                  tmpStr = targetArray[i].slice(0, LINE_LENGTH);
                  break;
                }
              } else if (mode > 1) {
                // goto second
                secondFlg = true
              } else {
                // error
                Modifiy.logger.error('error');
                break;
              }
            }
          }
        }
        // complete
        resolve(tmpStr);

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject('error');
      }
    });
  }

  // remove annotation
  removeAnnotation(str: string): Promise<removed | string> {
    return new Promise(async (resolve, reject) => {
      try {
        Modifiy.logger.silly('modify: remove annotation');
        // annotation distinction
        const annotation: string = '-------------------------------------------------------';

        // remove
        if (str.includes(annotation)) {
          // split
          const result: string[] = str.split(annotation);
          // header
          const header: string = result[0] ?? '';
          // complete
          resolve({
            header: header,
            body: str.split(annotation)[2],
          });
        } else {
          resolve({
            header: '',
            body: str,
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
        Modifiy.logger.silly('modify: remove footer annotation');
        // distinction
        const annotation: string = '青空文庫作成ファイル：';
        // remove footer
        if (str.includes(annotation)) {
          // split
          const result: string[] = str.split(annotation);
          // result
          resolve(result[0]);
        } else {
          resolve(str);
        }

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject('error');
      }
    });
  }

  // remove ruby(《》)
  removeRuby(str: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        Modifiy.logger.silly('modify: remove ruby(《》)');
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
        Modifiy.logger.silly('modify: remove brackets');
        // result
        resolve(str.replace(/［＃.+?］.*?/g, ''));

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
        Modifiy.logger.silly('remove repeat signs');
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
        Modifiy.logger.silly('modify: remove symbols');
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

  // replace old to new
  replaceOldToNew(str: string, mode: number): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        Modifiy.logger.silly('modify: exchange old to new');
        // reverse
        let reverseFlg: boolean;
        // comparison table
        let comparisonArray: any[];
        // tmp string
        let tmpStr: string = '';
        // tmp input
        tmpStr = str;

        // switch on mode
        switch (mode) {
          case 1:
            Modifiy.logger.silly("replaceOldToNew: kanji mode.");
            comparisonArray = kanjiArray;
            reverseFlg = false;
            break;
          case 2:
            Modifiy.logger.silly("replaceOldToNew: kana mode.");
            comparisonArray = kanaArray;
            reverseFlg = false;
            break;
          case 3:
            Modifiy.logger.silly("replaceOldToNew: small mode.");
            comparisonArray = smallArray;
            reverseFlg = true;
            break;
          case 4:
            Modifiy.logger.silly("replaceOldToNew: jion mode.");
            comparisonArray = jionArray;
            reverseFlg = true;
            break;
          default:
            Modifiy.logger.silly(`Sorry, we are out of ${mode}.`);
            comparisonArray = [];
            reverseFlg = false;
        }

        if (comparisonArray.length > 0) {
          for (let i = 0; i < comparisonArray.length; i++) {
            if (reverseFlg) {
              // remove footer
              if (tmpStr.includes(comparisonArray[i][0])) {
                tmpStr = tmpStr.replaceAll(comparisonArray[i][0], comparisonArray[i][1]);
                Modifiy.logger.silly(`replaced ${comparisonArray[i][0]} to ${comparisonArray[i][1]}`);
              }
            } else {
              // remove footer
              if (tmpStr.includes(comparisonArray[i][1])) {
                tmpStr = tmpStr.replaceAll(comparisonArray[i][1], comparisonArray[i][0]);
                Modifiy.logger.silly(`replaced ${comparisonArray[i][1]} to ${comparisonArray[i][0]}`);
              }
            }
          }
        }
        // finished
        resolve(tmpStr);

      } catch (e: unknown) {
        Modifiy.logger.error(e);
        // reject
        reject('error');
      }
    });
  }
}
