# How to add a language to NFT Marketplace

## First step

Under lang folder copy en-US.json and create a json file with your language code and translate it on same folder.

## Second step

Add the language you wanna add to src/constants/index.ts file

## Third step

Run

` yarn compile lang/your-language-code.json --out-file compiled-lang/your-language-code.json`

Example for pt-BR

`yarn compile lang/pt-BR.json --out-file compiled-lang/pt-BR.json`

## Fourth step

Add language you wanna add to src/utils/intl.ts file
