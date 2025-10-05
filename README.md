<table>
	<thead>
    	<tr>
      		<th style="text-align:center">English</th>
      		<th style="text-align:center"><a href="README-ja.md">日本語</a></th>
    	</tr>
  	</thead>
</table>

## name

aozoraEditor

## Overview

This is editor for aozora scraped files.

## Requirement

Windows10 ~

## Setting

### From souce

1. Download zip or pull repository.
2. Execute below on cmd.
   ```
   npm install
   npm start
   ```

- node.js environment required.

### From exe

1. Download exe file from release.
2. DoubleClick on exe file and install.

## Usage

1. put zip files into resources/file/source.
2. Press any buttons.

- Extract: extract zip to txt. out from resources/file/source to resources/file/extracted.
- Modify: modify unnecessary text and old character to new one. from resources/file/extracted out to resources/file/modified.
- Rename: rename filename to formatted style. out from resources/file/modified to resources/file/renamed.
- Extra: extract first line from txt file in resources/file/intro and export to desktop as csv file. radio explanation is below.
  - 1st line: extract first text line.
  - 1st line\*: extract first text line ignoring first short line (under 4 char).
  - 2nd line: extract second text line.
  - 3rd line: extract third text line.

## Features

- You can change default language to English by pressing "Config" button and check off "japanese".

## Author

N3-Uchimura

## Reference

[kkh](https://github.com/okikae/kkh/)

## Licence

[MIT](https://mit-license.org/)
