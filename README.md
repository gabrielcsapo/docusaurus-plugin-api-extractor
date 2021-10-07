# docusaurus-plugin-api-extractor

> Docusaurus plugin to use https://api-extractor.com

## Installation

```
npm install docusaurus-plugin-api-extractor --save-dev
```

## Usage

### Config

Add the plugin to `docusaurus.config.js` and specify the required options (see [options](#options)).

```js
module.exports = {
  plugins: [
    [
      "docusaurus-plugin-api-extractor",

      // Plugin / Api extractor options options
      {
        entryPoints: ["../src/index.ts"],
      },
    ],
  ],
};
```

## Options

### TypeDoc options

To configure TypeDoc, pass any relevant [Api Extractor options](https://api-extractor.com/pages/setup/invoking/) to the config.

At a minimum the `entryPoints` options will need to be set.

```js
entryPoints: ['../src/index.ts'],
```

### Plugin options

Options specific to the plugin should also be declared in the same object.

| Name          | Default | Required | Description                                                                |
| :------------ | :------ | :------- | :------------------------------------------------------------------------- |
| `out`         | `"api"` | false    | Output directory relative to docs directory.                               |
| `entryPoints` | `[]`    | true     | Entry point globs to documentation that will be built to the out directory |

### An example configuration

```js
module.exports = {
  plugins: [
    [
      "docusaurus-plugin-api-extractor",
      {
        entryPoints: ["../src/index.ts"],
        out: "api-xyz",
      },
    ],
  ],
};
```
