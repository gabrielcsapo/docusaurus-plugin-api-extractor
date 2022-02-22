import { ApiItem, ApiItemKind, ApiModel } from '@microsoft/api-extractor-model';
import { StringBuilder, TSDocConfiguration, DocNode } from '@microsoft/tsdoc';
import path from 'path';

import { CustomDocNodes } from './nodes';
import { StandardMarkdownEmitter } from './standard-markdown-emitter';
import { getFilenameForApiItem, getLinkFilenameForApiItem } from './builders/file-naming';
import {
  IDocumenterDelegate,
  IInternalDocumenterDelegate,
  IVisitMeta,
  ContainerNode,
  Visitor,
  TerminalNode
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

  /**
   * Generates an object of markdown files based on the ApiModel
   * @returns An object of markdown files
   * @public
   */
  public async generate(): Promise<Record<string, string>> {
    this._writeApiItemPage(this._delegate.apiModel);
    const pages = this._pages;
    this._pages = {};
    return pages;
  }

  /**
   * Generates markdown files based on the ApiModel
   * @public
   */
  public async generateFiles(): Promise<void> {
    Object.entries(await this.generate()).forEach(async ([filePath, content]) => {
      await fs.writeFile(filePath, content);
    });
  }

  /**
   * Generates an object that can be used for sidebars. It optionally takes a visitor to participate in the generation
   * @param visitor A {@link SidebarVisitor} that can participate in the sidebar creation
   * @returns
   */
  public async generateSidebar(visitor: Partial<Visitor> = {}): Promise<ContainerNode[]> {
    const internalVisitor = new SidebarVisitor(visitor);
    const apiModel = this._delegate.apiModel;
    const output: ContainerNode[] = [];
    const modelNode = internalVisitor.Model(apiModel, this._metaFor(apiModel));
    output.push(modelNode);

    this._visit(modelNode.items, apiModel, internalVisitor);
    return output;
  }

  private _visit(output: unknown[], apiItem: ApiItem, visitor: SidebarVisitor): void {
    if (!apiItem.members) return;
    for (const item of apiItem.members) {
      switch (item.kind) {
        case ApiItemKind.None:
        case ApiItemKind.EntryPoint:
          this._visit(output, item, visitor);
          break;
        case ApiItemKind.Class:
        case ApiItemKind.Interface:
        case ApiItemKind.Package:
        case ApiItemKind.Namespace:
          const containerNode = visitor[item.kind](item, this._metaFor(item));
          output.push(containerNode);
          this._visit(containerNode.items, item, visitor);
          break;
        default:
          const terminalNode = visitor[item.kind](item, this._metaFor(item)) as TerminalNode;
          output.push(terminalNode);
          this._visit(output, item, visitor);
      }
    }
  }

  private _metaFor(apiItem: ApiItem): IVisitMeta {
    const id = `${getLinkFilenameForApiItem(apiItem).replace('./', '').replace('.md', '')}`;

    const type = API_ITEM_TO_FRAMEWORK_ITEM_TYPE.get(apiItem) || apiItem.displayName;

    return { id, type };
  }

  private _writeApiItemPage(apiItem: ApiItem): void {
    const { _configuration: configuration, _delegate: delegate } = this;
    const primitiveBuilders = new PrimitiveBuilders(configuration, delegate.apiModel);
    const section = primitiveBuilders.section();

    const sectionBuilders = new SectionBuilders(
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

    const filename = path.join(this._delegate.outputFolder, getFilenameForApiItem(apiItem));

    const builder = new StringBuilder();

    this._pages[filename] = this._emitter.emit(section, builder, {
      contextApiItem: apiItem,
      onGetFilenameForApiItem: (apiItemForFilename: ApiItem) => {
        return getLinkFilenameForApiItem(apiItemForFilename);
      }
    });
  }
}
