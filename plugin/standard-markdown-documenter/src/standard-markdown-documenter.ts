import { ApiItem, ApiItemKind, ApiModel } from '@microsoft/api-extractor-model';
import { StringBuilder, DocSection, TSDocConfiguration, DocNode } from '@microsoft/tsdoc';
import path from 'path';

import { CustomDocNodes } from './nodes';
import { StandardMarkdownEmitter } from './standard-markdown-emitter';
import { getFilenameForApiItem, getLinkFilenameForApiItem } from './builders/file-naming';
import {
  IDocumenterDelegate,
  IInternalDocumenterDelegate,
  IVisitMeta,
  ParentNode,
  Visitor
} from './interfaces';
import { promises as fs } from 'fs';
import { InternalDelegate } from './default-delegate';
import { PrimitiveBuilders } from './builders/primitive-builders';
import { API_ITEM_TO_FRAMEWORK_ITEM_TYPE, SectionBuilders } from './builders/section-builders';
import { SidebarVisitor } from './visitor';

/**
 * Responsible for taking an {@link @microsoft/api-extractor-model#ApiModel} and producing standard markdown from it
 *
 * @example
 * ```ts
 * import { ApiModel } from '@microsoft/api-extractor-model';
 * import { StandardMarkdownDocumenter } from 'standard-markdown-documenter';
 *
 * const model = new ApiModel();
 *
 * model.loadPackage(join(__dirname, './my.api.json'));
 *
 * const documenter = new StandardMarkdownDocumenter(model, './out');
 *
 * await documenter.generateFiles();
 * ```
 *
 * @public
 */
export class StandardMarkdownDocumenter {
  private _emitter: StandardMarkdownEmitter;
  private _pages: Record<string, string> = {};
  private _configuration: TSDocConfiguration;
  private _delegate: IInternalDocumenterDelegate;

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

    this._delegate = delegate;
    this._emitter = new StandardMarkdownEmitter(delegate);
    CustomDocNodes.configuration = delegate.configureTSDoc(CustomDocNodes.configuration);
    this._configuration = CustomDocNodes.configuration;
  }

  public async generate(): Promise<Record<string, string>> {
    this._writeApiItemPage(this._delegate.apiModel);
    const pages: Record<string, string> = this._pages;
    this._pages = {};
    return pages;
  }

  public async generateFiles(): Promise<void> {
    Object.entries(await this.generate()).forEach(async ([filePath, content]) => {
      await fs.writeFile(filePath, content);
    });
  }

  public async generateSidebar(visitor: Partial<Visitor> = {}): Promise<ParentNode[]> {
    const internalVisitor: SidebarVisitor = new SidebarVisitor(visitor);
    const apiModel: ApiModel = this._delegate.apiModel;
    const output = [];
    const modelNode = {
      label: 'Packages',
      items: [
        {
          label: 'Overview'
        }
      ]
    };

    output.push(modelNode);

    // internalVisitor[ApiItemKind.Model](apiModel);

    // this._visit(apiModel, internalVisitor);
    this._myVisit(modelNode.items, apiModel, internalVisitor);
    return output;
  }

  private _myVisit(output: unknown[], apiItem: ApiItem, visitor: SidebarVisitor) {
    if (!apiItem.members) return;
    for (const item of apiItem.members) {
      switch (item.kind) {
        case ApiItemKind.None:
        case ApiItemKind.EntryPoint:
          this._myVisit(output, item, visitor);
          break;
        case ApiItemKind.Class:
        case ApiItemKind.Interface:
        case ApiItemKind.Package:
        case ApiItemKind.Namespace:
          const containerNode = visitor[item.kind](apiItem, this._metaFor(apiItem));
          output.push(containerNode);
          this._myVisit(containerNode.items, item, visitor);
          break;
        default:
          const terminalNode = visitor[item.kind](apiItem, this._metaFor(apiItem));
          output.push(terminalNode);
          this._myVisit(output, item, visitor);
      }
    }
  }

  private _visit(apiItem: ApiItem, visitor: SidebarVisitor): void {
    if (apiItem.members.length === 0) return;
    for (const item of apiItem.members) {
      if (item.kind !== 'EntryPoint' && item.kind !== 'None') {
        visitor[item.kind](item, this._metaFor(item));
      }

      this._visit(item, visitor);
    }
  }

  private _metaFor(apiItem: ApiItem): IVisitMeta {
    const id: string = `${getLinkFilenameForApiItem(apiItem).replace('./', '').replace('.md', '')}`;

    const type: string = API_ITEM_TO_FRAMEWORK_ITEM_TYPE.get(apiItem) || apiItem.displayName;

    return { id, type };
  }

  private _writeApiItemPage(apiItem: ApiItem): void {
    const { _configuration: configuration, _delegate: delegate } = this;
    const primitiveBuilders: PrimitiveBuilders = new PrimitiveBuilders(configuration, delegate.apiModel);
    const section: DocSection = primitiveBuilders.section();

    const sectionBuilders: SectionBuilders = new SectionBuilders(
      primitiveBuilders,
      section,
      delegate,
      apiItem,
      this._writeApiItemPage.bind(this)
    );

    delegate.writePage({
      currentPage: section,
      apiItem,
      tsDocConfiguration: configuration,
      append(docNode: DocNode): void {
        section.appendNode(docNode);
      },
      next: (apiItem: ApiItem) => {
        this._writeApiItemPage(apiItem);
      },
      primitives: primitiveBuilders,
      sections: sectionBuilders
    });

    const filename: string = path.join(this._delegate.outputFolder, getFilenameForApiItem(apiItem));

    const builder: StringBuilder = new StringBuilder();

    this._pages[filename] = this._emitter.emit(section, builder, {
      contextApiItem: apiItem,
      onGetFilenameForApiItem: (apiItemForFilename: ApiItem) => {
        return getLinkFilenameForApiItem(apiItemForFilename);
      }
    });
  }
}
