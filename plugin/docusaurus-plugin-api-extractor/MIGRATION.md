# MIGRATIONS

## Migrating from 1.0.0 to 2.0.0

While there are no hard breaking changes in 2.0.0 in terms of functionality there are some dependencies that can now be dropped and files you can delete. To migrate to 2.0.0 please see the following steps in the root of your project.

1. `yarn add docusaurus-plugin-api-extractor@^2.0.0 --dev`
2. `yarn rm @microsoft/api-documenter --dev`
3. `yarn rm docusaurus-plugin-api-extractor-markdown-documenter --dev`
4. `rm api-documenter.json`
5. `touch tsdoc.json`
6. Copy and paste the following into `tsdoc.json`

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json",
  "tagDefinitions": [
    {
      "tagName": "@frameworkItemType",
      "syntaxKind": "block",
      "allowMultiple": true
    },
    {
      "tagName": "@modulePath",
      "syntaxKind": "block",
      "allowMultiple": true
    }
  ]
}
```

You should now be able to run `docusaurus api-extractor:run` as you had before.