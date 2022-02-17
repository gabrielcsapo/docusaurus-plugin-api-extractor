import { ApiItemKind, ApiModel } from '@microsoft/api-extractor-model';
import {
  DocNodeContainer,
  DocNodeKind,
  DocPlainText,
  IDocNodeContainerParameters,
  IDocPlainTextParameters,
  TSDocConfiguration
} from '@microsoft/tsdoc';
import { join } from 'path';
import {
  IDocumenterDelegate,
  IMarkdownDelegateContext,
  IWriteNodeContext,
  StandardMarkdownDocumenter,
  YamlList
} from '../mark';

it('kitchen sink', async () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.custom-types.json'));
  const documenter = new StandardMarkdownDocumenter(model, 'foo');

  expect(await documenter.generate()).toMatchSnapshot();
});

it('it defaults to built in delegate', async () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.custom-types.json'));

  const documenter = new StandardMarkdownDocumenter(model, 'foo');

  expect(await documenter.generate()).toMatchSnapshot();
});

it('if a custom delegate is passed with only the required fields the default implementation runs for the methods', async () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.custom-types.json'));

  class Delegate implements IDocumenterDelegate {
    public apiModel: ApiModel;
    public outputFolder: string;
    public constructor(apiModel: ApiModel, outputFolder: string) {
      this.apiModel = apiModel;
      this.outputFolder = outputFolder;
    }
  }

  const documenter = new StandardMarkdownDocumenter(new Delegate(model, 'foo'));

  expect(await documenter.generate()).toMatchSnapshot();
});

it('delegate can be used to customize frontmatter', async () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.custom-types.json'));

  class Delegate implements IDocumenterDelegate {
    public apiModel: ApiModel;
    public outputFolder: string;
    public constructor(apiModel: ApiModel, outputFolder: string) {
      this.apiModel = apiModel;
      this.outputFolder = outputFolder;
    }

    public prepareFrontmatter(filePath: string, title: string): YamlList {
      return {
        basicallyAnything: 'can go here',
        title: `${title} -- CUSTOM THINGY ${filePath}`
      };
    }
  }

  const documenter = new StandardMarkdownDocumenter(new Delegate(model, 'foo'));

  expect(await documenter.generate()).toMatchSnapshot();
});

it('delegate can be used to customize the page', async () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.custom-types.json'));

  class Delegate implements IDocumenterDelegate {
    public apiModel: ApiModel;
    public outputFolder: string;
    public constructor(apiModel: ApiModel, outputFolder: string) {
      this.apiModel = apiModel;
      this.outputFolder = outputFolder;
    }

    public writePage(ctx: IMarkdownDelegateContext): void {
      if (ctx.apiItem.kind === ApiItemKind.Model) {
        ctx.append(ctx.primitives.code('const foo = "Bar";', 'typescript'));
      }
    }
  }

  const documenter = new StandardMarkdownDocumenter(new Delegate(model, 'foo'));

  expect(await documenter.generate()).toMatchSnapshot();
});

it('delegate can be used to register custom nodes', async () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.custom-types.json'));

  class FuntimeNode extends DocPlainText {
    public constructor(configurgation: IDocPlainTextParameters) {
      configurgation.text = `🎉 ${configurgation.text} 🎉`;
      super(configurgation);
    }

    public get kind(): string {
      return 'FunTime';
    }
  }

  class Delegate implements IDocumenterDelegate {
    public apiModel: ApiModel;
    public outputFolder: string;
    public constructor(apiModel: ApiModel, outputFolder: string) {
      this.apiModel = apiModel;
      this.outputFolder = outputFolder;
    }

    public writePage(ctx: IMarkdownDelegateContext): void {
      console.log(ctx.tsDocConfiguration.docNodeManager.isAllowedChild(DocNodeKind.Section, 'FunTime'));
      ctx.append(new FuntimeNode({ configuration: ctx.tsDocConfiguration, text: 'NEAT' }));
    }

    public writeNode(ctx: IWriteNodeContext): void {
      const {
        docNode,
        context: { writer }
      } = ctx;
      if (docNode instanceof FuntimeNode) {
        writer.write(docNode.text);
      }
    }

    public configureTSDoc(configuration: TSDocConfiguration): TSDocConfiguration {
      configuration.docNodeManager.registerDocNodes('my-package-name', [
        { docNodeKind: 'FunTime', constructor: FuntimeNode }
      ]);

      configuration.docNodeManager.registerAllowableChildren(DocNodeKind.Section, ['FunTime']);

      return configuration;
    }
  }

  const documenter = new StandardMarkdownDocumenter(new Delegate(model, 'foo'));

  expect(await documenter.generate()).toMatchSnapshot();
});

it('delegate can be used to register custom nodes that require recursion', async () => {
  const model = new ApiModel();
  model.loadPackage(join(__dirname, './fixtures/api-model.custom-types.json'));

  class FuntimeContainerNode extends DocNodeContainer {
    public get kind(): string {
      return 'FunTimeContainer';
    }
    public constructor(params: IDocNodeContainerParameters) {
      super(params);
      this.appendNode(new DocPlainText({ configuration: params.configuration, text: ` 🎉 FUN 🎉` }));
      this.appendNode(new DocPlainText({ configuration: params.configuration, text: ` 🎉 TIME 🎉` }));
      this.appendNode(new DocPlainText({ configuration: params.configuration, text: ` 🎉 CONTAINER 🎉` }));
      this.appendNode(new DocPlainText({ configuration: params.configuration, text: ` 🎉 CHILDREN 🎉` }));
    }
  }

  class Delegate implements IDocumenterDelegate {
    public apiModel: ApiModel;
    public outputFolder: string;
    public constructor(apiModel: ApiModel, outputFolder: string) {
      this.apiModel = apiModel;
      this.outputFolder = outputFolder;
    }

    public writePage(ctx: IMarkdownDelegateContext): void {
      console.log(
        ctx.tsDocConfiguration.docNodeManager.isAllowedChild(DocNodeKind.Section, 'FunTimeContainer')
      );
      ctx.append(new FuntimeContainerNode({ configuration: ctx.tsDocConfiguration }));
    }

    public writeNode(ctx: IWriteNodeContext): void {
      const { docNode, writeNode } = ctx;
      if (docNode instanceof FuntimeContainerNode) {
        for (const child of docNode.getChildNodes()) {
          writeNode(child, ctx.context, false);
        }
      }
    }

    public configureTSDoc(configuration: TSDocConfiguration): TSDocConfiguration {
      configuration.docNodeManager.registerDocNodes('my-package-name', [
        { docNodeKind: 'FunTimeContainer', constructor: FuntimeContainerNode }
      ]);

      configuration.docNodeManager.registerAllowableChildren(DocNodeKind.Section, ['FunTimeContainer']);
      configuration.docNodeManager.registerAllowableChildren('FunTimeContainer', [DocNodeKind.PlainText]);

      return configuration;
    }
  }

  const documenter = new StandardMarkdownDocumenter(new Delegate(model, 'foo'));

  expect(await documenter.generate()).toMatchSnapshot();
});
