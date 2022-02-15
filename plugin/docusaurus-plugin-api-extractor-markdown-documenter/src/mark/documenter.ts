import {
  ApiClass,
  ApiEnum,
  ApiInterface,
  ApiItem,
  ApiItemKind,
  ApiModel,
  ApiNamespace,
  ApiPackage,
  ApiParameterListMixin
} from '@microsoft/api-extractor-model';
import { StringBuilder, DocSection } from '@microsoft/tsdoc';
import path from 'path';

import { CustomDocNodes } from './nodes';
import { StandardMarkdownEmitter } from './standard-markdown-emitter';
import { BodyBuilder, createPageBuilder } from './builders';
import { getFilenameForApiItem, getLinkFilenameForApiItem } from './builders/utils';
import { ISections } from './builders/interfaces';

export class Documenter {
  private _emitter: StandardMarkdownEmitter;
  private _apiModel: ApiModel;
  private _outputFolder: string;
  private _pages: Record<string, string> = {};
  private _pageBuilder: BodyBuilder;
  public constructor(apiModel: ApiModel, outputFolder: string) {
    this._apiModel = apiModel;
    this._outputFolder = outputFolder;
    this._emitter = new StandardMarkdownEmitter(apiModel);
    this._pageBuilder = createPageBuilder(
      CustomDocNodes.configuration,
      outputFolder,
      apiModel,
      (apiItem: ApiItem) => {
        this._writeApiItemPage(apiItem);
      }
    );
  }

  public generate(): Record<string, string> {
    this._writeApiItemPage(this._apiModel);
    return this._pages;
  }

  public generateFiles(): void {
    this.generate(); // todo loop
  }

  private _writeApiItemPage(apiItem: ApiItem): void {
    const page: DocSection = this._pageBuilder((b: ISections): void => {
      b.frontmatter(apiItem);
      b.breadcrumb(this._apiModel);
      b.pageHeading(apiItem);
      b.betaWarning(apiItem);
      b.deprecated(apiItem);
      b.decorators(apiItem);
      b.heritageTypes(apiItem);

      let appendRemarks: boolean = true;

      switch (apiItem.kind) {
        case ApiItemKind.Class:
        case ApiItemKind.Interface:
        case ApiItemKind.Namespace:
        case ApiItemKind.Package:
          b.remarks(apiItem);
          appendRemarks = false;
          break;
      }

      switch (apiItem.kind) {
        case ApiItemKind.Class:
          b.classTable(apiItem as ApiClass);
          break;
        case ApiItemKind.Enum:
          b.enumTable(apiItem as ApiEnum);
          break;
        case ApiItemKind.Interface:
          b.interfaceTable(apiItem as ApiInterface);
          break;
        case ApiItemKind.Constructor:
        case ApiItemKind.ConstructSignature:
        case ApiItemKind.Method:
        case ApiItemKind.MethodSignature:
        case ApiItemKind.Function:
          b.parameterTable(apiItem as ApiParameterListMixin);
          b.throws(apiItem);
          break;
        case ApiItemKind.Namespace:
          b.packageOrNamespace(apiItem as ApiNamespace);
          break;
        case ApiItemKind.Model:
          b.modelTable(apiItem as ApiModel);
          break;
        case ApiItemKind.Package:
          b.packageOrNamespace(apiItem as ApiPackage);
          break;
        case ApiItemKind.Property:
        case ApiItemKind.PropertySignature:
          break;
        case ApiItemKind.TypeAlias:
          break;
        case ApiItemKind.Variable:
          break;
        default:
          throw new Error('Unsupported API item kind: ' + apiItem.kind);
      }

      if (appendRemarks) {
        b.remarks(apiItem);
      }
    });

    const filename: string = path.join(this._outputFolder, getFilenameForApiItem(apiItem));

    const builder: StringBuilder = new StringBuilder();

    this._pages[filename] = this._emitter.emit(page, builder, {
      contextApiItem: apiItem,
      onGetFilenameForApiItem: (apiItemForFilename: ApiItem) => {
        return getLinkFilenameForApiItem(apiItemForFilename);
      }
    });
  }
}
