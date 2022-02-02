# docusaurus-plugin-api-extractor-markdown-documenter

This project houses an [api-documenter](https://github.com/microsoft/rushstack/tree/master/apps/api-documenter) plugin that is responsible for taking markdown produces by [api-extractor](https://api-extractor.com/) and make it compatible with [docusaurus](https://docusaurus.io/docs/markdown-features).

## Usage

This is to be used in conjunction with [docusaurus-plugin-api-extractor](../docusaurus-plugin-api-extractor/README.md). By running `docusaurus api-extractor:init` it will produce a `api-documenter.json` file that will configure this plugin. It should look like the following:

```json
{
  "outputTarget": "markdown",
  "plugins": [
    {
      "packageName": "docusaurus-plugin-api-extractor-markdown-documenter",
      "enabledFeatureNames": ["docusaurus-plugin-api-extractor-markdown-documenter"]
    }
  ]
}
```

This plugin will now be ran when running `docusaurus api-extractor:run`