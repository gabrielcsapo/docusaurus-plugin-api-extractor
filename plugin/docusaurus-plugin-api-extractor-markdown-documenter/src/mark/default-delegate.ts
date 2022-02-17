import { ApiItem, ApiItemKind, ApiModel } from '@microsoft/api-extractor-model';
import { TSDocConfiguration } from '@microsoft/tsdoc';
import { parse } from 'path';
import {
  IDocumenterDelegate,
  IInternalDocumenterDelegate,
  IMarkdownDelegateContext,
  IWriteNodeContext,
  YamlList
} from './interfaces';

export class InternalDelegate implements IInternalDocumenterDelegate {
  public outputFolder: string;
  public apiModel: ApiModel;
  private _delegate: IDocumenterDelegate;

  public constructor(delegate: IDocumenterDelegate) {
    this._delegate = delegate;
    this.apiModel = delegate.apiModel;
    this.outputFolder = delegate.outputFolder;
  }

  public configureTSDoc(currentConfiguration: TSDocConfiguration): TSDocConfiguration {
    if (this._delegate.configureTSDoc) {
      return this._delegate.configureTSDoc(currentConfiguration);
    }

    return currentConfiguration;
  }

  public prepareFrontmatter(fileName: string, pageTitle: string): YamlList {
    if (this._delegate.prepareFrontmatter) {
      return this._delegate.prepareFrontmatter(fileName, pageTitle);
    }
    const { name: id } = parse(fileName);
    const slug: string | undefined = id === 'index' ? '/' : undefined;

    const list: YamlList = {
      id,
      hide_title: true,
      title: pageTitle,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      custom_edit_url: null
    };

    if (slug) {
      list.slug = slug;
    }

    return list;
  }

  public writeNode(ctx: IWriteNodeContext): void {
    if (this._delegate.writeNode) {
      this._delegate.writeNode(ctx);
    } else {
      throw new Error(`Unsupported DocNode kind ${ctx.docNode.kind}`);
    }
  }

  public writePage(ctx: IMarkdownDelegateContext): void {
    if (this._delegate.writePage) {
      this._delegate.writePage(ctx);
    } else {
      const { sections: b, apiItem } = ctx;
      b.frontmatter();
      b.breadcrumb();
      b.pageHeading();
      b.betaWarning();
      b.deprecated();
      b.decorators();
      b.heritageTypes();

      let appendRemarks: boolean = true;

      switch (apiItem.kind) {
        case ApiItemKind.Class:
        case ApiItemKind.Interface:
        case ApiItemKind.Namespace:
        case ApiItemKind.Package:
          b.remarks();
          appendRemarks = false;
          break;
      }

      switch (apiItem.kind) {
        case ApiItemKind.Class:
          b.classTable();
          break;
        case ApiItemKind.Enum:
          b.enumTable();
          break;
        case ApiItemKind.Interface:
          b.interfaceTable();
          break;
        case ApiItemKind.Constructor:
        case ApiItemKind.ConstructSignature:
        case ApiItemKind.Method:
        case ApiItemKind.MethodSignature:
        case ApiItemKind.Function:
          b.parameterTable();
          b.throws();
          break;
        case ApiItemKind.Namespace:
          b.packageOrNamespace();
          break;
        case ApiItemKind.Model:
          b.modelTable();
          break;
        case ApiItemKind.Package:
          b.packageOrNamespace();
          break;
        case ApiItemKind.Property:
        case ApiItemKind.PropertySignature:
          break;
        case ApiItemKind.TypeAlias:
          break;
        case ApiItemKind.Variable:
          break;
        default:
          throw new Error(`Unsupported API item kind: ${apiItem.kind}`);
      }

      if (appendRemarks) {
        b.remarks();
      }
    }
  }
}

export class DefaultDelegate implements IDocumenterDelegate {
  public apiModel: ApiModel;
  public outputFolder: string;

  public constructor(apiModel: ApiModel, oututPath: string) {
    this.apiModel = apiModel;
    this.outputFolder = oututPath;
  }

  public prepareFrontmatter(fileName: string, pageTitle: string): YamlList {
    const { name: id } = parse(fileName);
    const slug: string | undefined = id === 'index' ? '/' : undefined;

    const list: YamlList = {
      id,
      hide_title: true,
      title: pageTitle,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      custom_edit_url: null
    };

    if (slug) {
      list.slug = slug;
    }

    return list;
  }
}
