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
-o, --outDir <name>  Name of the directory that will be placed in the documentation root (default: "api")
--ci                 Indicates that API Extractor is running in CI and makes sure the public API hasn't changed
--verbose            Enable verbose logging (default: false)
-h, --help           display help for command
```

## Running as a CI Job

If you're running API documentation generation as part of a CI job, we recommend that you run `docusaurus api-extractor:run` with the `--ci` flag. Doing so will enable validation of the public API of your project. You can read more about the validation @microsoft/api-extractor [here](https://api-extractor.com/pages/overview/demo_api_report/).

### An example plugin configuration

**Basic Usage**
```js
module.exports = {
  plugins: ['docusaurus-plugin-api-extractor'],
};
```

**Advanced Usage**

### `options.siteDir`
If you have project where your documentation website doesn't sit in the root of the project you can specify an alternative site directory.

```js
module.exports = {
  plugins: ['docusaurus-plugin-api-extractor', { siteDir: 'my-site' }],
};
```

### `options.entryPoints`

If you have multiple packages that you would like to generate you can use `entryPoints`. The plugin will generate temporary a [`api-extractor.json`](https://api-extractor.com/pages/configs/api-extractor_json) file for each entry and use that information to setup [`mainEntryPointFilePath`](https://api-extractor.com/pages/configs/api-extractor_json/#mainentrypointfilepath) and other path related options.

```js
module.exports = {
  plugins: ['docusaurus-plugin-api-extractor', {
    entryPoints: {
      api: './dist/api/index.d.ts',
      client: './dist/client/index.d.ts',
      library: './node_modules/my-library/index.d.ts'
    }
  }],
};
```