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

- node.js の実行環境が必要です。

## Usage

1. ダウンロードした ZIP ファイルを、「resources/file/source」に入れます。
2. 以下のボタンを上から順番に押していきます。

- ZIP 解凍:「resources/file/source」内の ZIP ファイルを解凍し、解凍した TXT ファイルを「resources/file/extracted」内に保存します。
- TXT 修正: 「resources/file/extracted」内の TXT ファイルそれぞれに対し、不要なテキストを除去し、旧字体/旧かなを新字体/新かなに置換して「resources/file/modified」に保存します。
- リネーム: 「resources/file/modified」内の TXT ファイル名を「ID*作品名*作者名.txt」に変換し、「resources/file/renamed"」内に保存します。
- （番外編）先頭抽出: 「resources/file/intro」内の TXT ファイル名から書き出しの文章を抽出し、デスクトップに CSV として書き出します。ラジオボタンは以下のとおりです。
  - 1 行目: 文章部分の 1 行目を抽出します。
  - 1 行目+: 文章部分で最初にヒットした 4 文字以下の行を無視して、文章部分の 2 行目を抽出します。
  - 2 行目: 文章部分の 2 行目を抽出します。
  - 3 行目: 文章部分の 3 行目を抽出します。

## Features

- 「設定」ボタンを押して設定ページに移動し、「日本語」のチェックを外すことで英語になります。

## Author

N3-Uchimura

## Reference

[kkh](https://github.com/okikae/kkh/)

## Licence

[MIT](https://mit-license.org/)
