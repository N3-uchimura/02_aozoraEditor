<table>
	<thead>
    	<tr>
      		<th style="text-align:center"><a href="README.md">English</a></th>
      		<th style="text-align:center">日本語</th>
    	</tr>
  	</thead>
</table>

## name

青空エディタ

## Overview

[aozoraScraper](https://github.com/N3-uchimura/02_aozoraScraper "青空スクレイパー")

により取得した zip ファイルから txt ファイルを抽出し、整形及びリネームします。

## Requirement

Windows10 ~

## Setting

### From souce

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

### From exe

1. リリースから EXE ファイルをダウンロードします。
2. ダウンロードした EXE ファイルを実行し、インストールします。

## Usage

1. ダウンロードした ZIP ファイルを、「./file/source」に入れます。
2. 以下のボタンを上から順番に押していきます。

- ZIP 解凍:「./file/source」内の ZIP ファイルを解凍し、解凍した TXT ファイルを「./file/extracted」内に保存します。
- TXT 修正: 「./file/extracted」内の TXT ファイルそれぞれに対し、不要なテキストを除去し、旧字体/旧かなを新字体/新かなに置換して「./file/modified」に保存します。
- リネーム: 「./file/modified」内の TXT ファイル名を「ID*作品名*作者名.txt」に変換し、「./file/renamed"」内に保存します。

## Features

- 「設定」ボタンを押して設定ページに移動し、「日本語」のチェックを外すことで英語になります。

## Author

N3-Uchimura

## Reference

[kkh](https://github.com/okikae/kkh/)

## Licence

[MIT](https://mit-license.org/)
