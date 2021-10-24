# docusaurus-plugin-api-extractor

> Docusaurus plugin to use https://api-extractor.com

## Installation

```
npm install docusaurus-plugin-api-extractor --save-dev
```

## Usage

> Please make sure you have enabled the following options in your `tsconfig.json` to have this plugin work correctly.

> "declaration": true - This enables generation of the .d.ts files that API Extractor will analyze. By design, TypeScript source files are not directly analyzed, but instead must be first processed by your compiler.

> "declarationMap": true - This enables generation of .d.ts.map files that allow API Extractor errors to be reported using line numbers from your original source files; without this, the error locations will instead refer to the generated .d.ts files.

This plugin works as a plugin that can be configured in `docusaurus.config.js` and as an extension the docusaurus CLI to setup a new project with api-extractor and enable dry runs.

```
docusaurus api-extractor:init
```

Use this command when setting up API Extractor for a new project. It writes an api-extractor.json config file template with code comments that describe all the settings. The file will be written in the current directory.

```
docusaurus api-extractor:run
```

Invokes API Extractor and API documenter on a project

### Config

Add the plugin to `docusaurus.config.js` and specify the required options (see [options](#options)).

```js
module.exports = {
  plugins: [
    [
      'docusaurus-plugin-api-extractor',
      {
        // Plugin options
      },
    ],
  ],
};
```

## Options

At a minimum the `srcDir`, `outDir`, `verbose` and `force` options will need to be set.

### Plugin options

Options specific to the plugin should also be declared in the same object.

```ts
interface PluginOptions {
  srcDir: string; // Path to the sources files (default: "src")
  outDir: string; // Name of the directory that will be placed in the documentation root (default: "api")
  force?: boolean; // Skips caching and forces the docs to be rebuilt (default: false)
  verbose?: boolean; // Enable verbose logging (default: false)
}
```

### An example configuration

```js
module.exports = {
  plugins: [
    [
      'docusaurus-plugin-api-extractor',
      {
        srcDir: 'src',
        outDir: 'api-xyz',
      },
    ],
  ],
};
```
