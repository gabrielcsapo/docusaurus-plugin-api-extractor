# docusaurus-plugin-api-extractor

> Docusaurus plugin to use https://api-extractor.com

## Installation

```
npm install @microsoft/api-extractor @microsoft/api-documenter docusaurus-plugin-api-extractor docusaurus-plugin-api-extractor-markdown-documenter --save-dev
```

## Usage

> Please make sure you have enabled the following options in your `tsconfig.json` to have this plugin work correctly.

> "declaration": true - This enables generation of the .d.ts files that API Extractor will analyze. By design, TypeScript source files are not directly analyzed, but instead must be first processed by your compiler.

> "declarationMap": true - This enables generation of .d.ts.map files that allow API Extractor errors to be reported using line numbers from your original source files; without this, the error locations will instead refer to the generated .d.ts files.

This plugin extends Docusaurus' command line by adding the following commands.

### api-extractor:init

```
docusaurus api-extractor:init
```

Use this command when setting up API Extractor for a new project. It writes an api-extractor.json and api-documenter.json file. The api-extractor.json config file template with code comments that describe all the settings. These files will be written in the current directory.

#### CLI Options

```
-h, --help  display help for command
```

### api-extractor:run

```
docusaurus api-extractor:run
```

This runs api-extractor and api-documenter to produce Docusaurus formatted Markdown files and a `api-sidebar.js` file which can be used within your `sidebar.js` file. Please see the example website for more details.

Due to how Docusaurus plugins currently work, this command should always be ran before `docusaurus watch` or `docusaurus build`.

#### CLI Options

```
-s, --srcDir <path>  Path to the sources files (default: "src")
-o, --outDir <name>  Name of the directory that will be placed in the documentation root (default: "api")
--force              Skips caching and forces the docs to be rebuilt (default: false)
--local              Indicates that API Extractor is running as part of a local build, e.g. on a developer's machine.
--verbose            Enable verbose logging (default: false)
-h, --help           display help for command
```

### An example configuration

```js
module.exports = {
  plugins: ['docusaurus-plugin-api-extractor'],
};
```
