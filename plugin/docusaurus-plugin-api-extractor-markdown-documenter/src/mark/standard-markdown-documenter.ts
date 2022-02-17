import { ApiItem, ApiModel } from '@microsoft/api-extractor-model';
import { StringBuilder, DocSection } from '@microsoft/tsdoc';
import path from 'path';

import { CustomDocNodes } from './nodes';
import { StandardMarkdownEmitter } from './standard-markdown-emitter';
import { PageBuilder, createPage } from './builders/create-page';
import { getFilenameForApiItem, getLinkFilenameForApiItem } from './builders/file-naming';
import { IDocumenterDelegate, IInternalDocumenterDelegate } from './interfaces';
import { promises as fs } from 'fs';
import { InternalDelegate } from './default-delegate';

export class StandardMarkdownDocumenter {
  private _emitter: StandardMarkdownEmitter;
  private _apiModel: ApiModel;
  private _outputFolder: string;
  private _pages: Record<string, string> = {};
  private _pageBuilder: PageBuilder;

  public constructor(delegate: IDocumenterDelegate);
  public constructor(apiModel: ApiModel, outputPath: string);
  public constructor(...args: unknown[]) {
    let delegate: IInternalDocumenterDelegate;
    if (args.length === 2) {
      if (args[0] instanceof ApiModel && typeof args[1] === 'string') {
        delegate = new InternalDelegate({ apiModel: args[0], outputFolder: args[1] });
      } else {
        throw new Error(`You must pass an APIModel and the outputFolder. Recieved: ${args[0]}\n${args[1]}`);
      }
    } else if (args.length === 1 && args[0] && typeof args[0] === 'object') {
      delegate = new InternalDelegate(args[0] as IDocumenterDelegate);
    } else {
      throw new Error(`You must pass either a custom delegate or the APIModel and outputFolder`);
    }

    this._apiModel = delegate.apiModel;
    this._outputFolder = delegate.outputFolder;
    this._emitter = new StandardMarkdownEmitter(delegate);
    CustomDocNodes.configuration = delegate.configureTSDoc(CustomDocNodes.configuration);
    this._pageBuilder = createPage(CustomDocNodes.configuration, delegate, (apiItem: ApiItem) => {
      this._writeApiItemPage(apiItem);
    });
  }

  public async generate(): Promise<Record<string, string>> {
    this._writeApiItemPage(this._apiModel);
    const pages: Record<string, string> = this._pages;
    this._pages = {};
    return pages;
  }

  public async generateFiles(): Promise<void> {
    Object.entries(await this.generate()).forEach(async ([filePath, content]) => {
      await fs.writeFile(filePath, content);
    });
  }

  private _writeApiItemPage(apiItem: ApiItem): void {
    const page: DocSection = this._pageBuilder(apiItem);

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
