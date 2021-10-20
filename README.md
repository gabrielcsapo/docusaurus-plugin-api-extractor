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

This plugin works as a plugin that can be configured in `docusaurus.config.js` and as an extension the docusaurus CLI to enable dry runs with the following command:

```
docusaurus api-extractor:build
```

### Config

Add the plugin to `docusaurus.config.js` and specify the required options (see [options](#options)).

```js
module.exports = {
  plugins: [
    [
      "docusaurus-plugin-api-extractor",
      {
        // Plugin options
      },
    ],
  ],
};
```

## Options

At a minimum the `entryPoint`, `projectFolder` and `tsConfigFile` options will need to be set.

### Plugin options

Options specific to the plugin should also be declared in the same object.

| Name            | Default          | Required                                                 | Description                                                                                                                                                                                                       |
| :-------------- | :--------------- | :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `out`           | `"api"`          | false                                                    | Output directory relative to `docsRoot` directory.                                                                                                                                                                |
| `docsRoot`      | `docs`           | Output directory for built out directory to be built do. |
| `entryPoint`    |                  | true                                                     | Entry point d.ts to start api-extractor from                                                                                                                                                                      |
| `projectFolder` |                  | true                                                     | relative path from current docs directory to project folder                                                                                                                                                       |
| `tsConfigFile`  |                  | true                                                     | relative path to tsConfigFile from current docs directory                                                                                                                                                         |
| `sidebarConfig` | { title: 'API' } | false                                                    | `_category_.json` options configured for [docusaurus](https://github.com/facebook/docusaurus/blob/8d92e9bcf5cf533719b07b17db73facea788fac1/packages/docusaurus-plugin-content-docs/src/sidebars/generator.ts#L30) |

### An example configuration

```js
module.exports = {
  plugins: [
    [
      "docusaurus-plugin-api-extractor",
      {
        projectFolder: "..",
        tsConfigFile: "../tsconfig.json",
        entryPoint: "../dist/index.d.ts",
        out: "api-xyz",
      },
    ],
  ],
};
```
