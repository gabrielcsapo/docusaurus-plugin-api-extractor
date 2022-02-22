# Standard Markdown Documenter


Provides a class and delegate interface for taking an [ApiModel](https://rushstack.io/pages/api/api-extractor-model.apimodel/) and producing standard markdown from it.

## Basic Usage

```ts
import { ApiModel } from '@microsoft/api-extractor-model';
import { StandardMarkdownDocumenter } from 'standard-markdown-documenter';

const model = new ApiModel();
model.loadPackage(join(__dirname, './my.api.json'));

const documenter = new StandardMarkdownDocumenter(model, './out');
await documenter.generateFiles();
```

## Custom Delegate

If would like to participate in the markdown generation process you can provide a delegate with the following interface.

```ts
export interface IDocumenterDelegate {
  outputFolder: string;
  apiModel: ApiModel;
  configureTSDoc?(configuration: TSDocConfiguration): TSDocConfiguration;
  writeNode?(writeCtx: IWriteNodeContext): void;
  prepareFrontmatter?(fileName: string, pageTitle: string): YamlList;
  writePage?(pageContext: IMarkdownDelegateContext): void;
}
```

### Example

```ts
import { ApiModel } from '@microsoft/api-extractor-model';
import { StandardMarkdownDocumenter, IDocumenterDelegate } from 'standard-markdown-documenter';

const model = new ApiModel();
model.loadPackage(join(__dirname, './my.api.json'));

interface MyDelegate implements IDocumenterDelegate {
  outputFolder = './out';
  apiModel = model;
  writePage(pageContext: IMarkdownDelegateContext) {
    const { apiItem, primitives: b, sections }
    if (pageContext.apiItem.kind === 'Class') {
      pageContext.append(b.heading(`🎉 ${apiItem.displayName}`));
      sections.classTable();
    }
  }
}

const documenter = new StandardMarkdownDocumenter(new MyDelegate());
await documenter.generateFiles();
```

Would produce something like:

```markdown
## 🎉 MyClass

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(args)](./my.myclass._constructor_.md) |  | Constructs a new instance of the <code>MyClass</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [args](./my.myclass.args.md) |  | Args |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [render()](./my.myclass.render.md) |  |  |
```