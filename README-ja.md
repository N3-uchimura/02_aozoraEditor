## name

青空エディタ

## Overview

[aozoraScraper](https://github.com/N3-uchimura/02_aozoraScraper, "青空スクレイパー")

により取得した zip ファイルから txt ファイルを抽出し、整形及びリネームします。

## Requirement

Windows10 ~

## Usage

1. リリースから ZIP ファイルをダウンロードするか、リポジトリを pull します。
2. コマンドプロンプトを開き、解凍したフォルダか git フォルダ内に移動します。
   ```
   cd C:\home
   ```
3. 以下のコマンドを実行します。
   ```
   npm install
   npm start
   ```
4. ダウンロードした ZIP ファイルを、「./file/source」に入れます。
5. 以下のボタンを上から順番に押していきます。

- Extract: ZIP ファイルを解凍し、解凍した TXT ファイルを「./file/extracted」内に保存します。
- Modify: 「./file/extracted」内の TXT ファイルそれぞれに対し、不要なテキストを除去し、旧（歴史的）仮名遣いを新仮名遣いに置換して「./file/modified」に保存します。
- Rename: 「./file/modified」内の TXT ファイル名を「ID*作品名*作者名.txt」に変換し、「./file/renamed"」内に保存します。

## Features

- 「設定」ボタンを押して設定ページに移動し、「日本語」のチェックを外すことで英語になります。

## Author

N3-Uchimura

## Licence

[MIT](https://mit-license.org/)
