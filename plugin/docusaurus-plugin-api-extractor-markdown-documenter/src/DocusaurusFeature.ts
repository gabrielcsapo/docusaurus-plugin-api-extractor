import {
  MarkdownDocumenterFeature,
  IMarkdownDocumenterFeatureOnBeforeWritePageArgs,
  MarkdownDocumenterFeatureContext,
  MarkdownDocumenterAccessor,
  IMarkdownDocumenterFeatureOnFinishedArgs,
  PluginFeatureInitialization
} from '@microsoft/api-documenter';
import { ApiDocumentedItem, ApiItem, ApiItemKind } from '@microsoft/api-extractor-model';
import fs from 'fs';
import ejs from 'ejs';
import { writeFileSync } from 'fs';
import prettier from 'prettier';
import { parse, join } from 'path';
import { ICategoryNode, IDocNode } from './interfaces';
import { toDocusaurusMarkDown } from './markdown/to-docusaurus-markdown';

const sidebar: string = fs.readFileSync(join(__dirname, './api-sidebar.ejs'), 'utf-8');
const tree: string = fs.readFileSync(join(__dirname, './api-sidebar-tree.ejs'), 'utf-8');
// eslint-disable-next-line @typescript-eslint/typedef
const sidebarTmpl = ejs.compile(sidebar);
// eslint-disable-next-line @typescript-eslint/typedef
const treeTmpl = ejs.compile(tree);

export interface IMarkdownDelegate {
  preProcessMarkdown?(
    ctx: MarkdownDocumenterFeatureContext,
    writePageArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs
  ): string;
  postProceessMarkdown?(
    ctx: MarkdownDocumenterFeatureContext,
    writePageArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs
  ): string;
  writeSidebar?(
    ctx: MarkdownDocumenterFeatureContext,
    writePageArgs: IMarkdownDocumenterFeatureOnFinishedArgs,
    sideBar: ICategoryNode[]
  ): void;
}

export interface IDocusaurusMarkdownPlugin {
  new (initialization: PluginFeatureInitialization): MarkdownDocumenterFeature;
}

export function newDocusaurusMarkdownPlugin(delegate: IMarkdownDelegate): IDocusaurusMarkdownPlugin {
  return class DocusaurusMarkdownPlugin extends MarkdownDocumenterFeature {
    public onBeforeWritePage(eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs): void {
      const { name: id } = parse(eventArgs.outputFilename);

      extractCustomTags({}, eventArgs.apiItem);

      eventArgs.pageContent = toDocusaurusMarkDown(eventArgs.pageContent, id);
      eventArgs.pageContent = delegate.preProcessMarkdown?.(this.context, eventArgs) ?? eventArgs.pageContent;
      eventArgs.pageContent =
        delegate.postProceessMarkdown?.(this.context, eventArgs) ?? eventArgs.pageContent;
    }

    public onFinished(eventArgs: IMarkdownDocumenterFeatureOnFinishedArgs): void {
      const navigationFile: ICategoryNode[] = [];
      const packages: ICategoryNode = {
        type: 'category',
        label: 'Packages',
        items: [overviewNode('index')],
        collapsed: false
      };
      navigationFile.push(packages);

      buildNavigation(packages.items!, this.context.apiModel, this.context.documenter);

      delegate.writeSidebar?.(this.context, eventArgs, navigationFile);
    }
  };
}

const DEFAULT_MARKDOWN_DELEGATE: IMarkdownDelegate = {
  writeSidebar(
    ctx: MarkdownDocumenterFeatureContext,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _writePageArgs: IMarkdownDocumenterFeatureOnFinishedArgs,
    sidebar: ICategoryNode[]
  ) {
    const sidebarFile: string = prettier.format(
      sidebarTmpl({
        sideBarItems: sidebar,
        dir: 'api',
        isSideBarItem,
        tree: treeTmpl
      }),
      { parser: 'babel', singleQuote: true }
    );

    writeFileSync(join(ctx.outputFolder, 'api-sidebar.js'), sidebarFile);
  }
};

export function newDefaultPlugin(): IDocusaurusMarkdownPlugin {
  return newDocusaurusMarkdownPlugin(DEFAULT_MARKDOWN_DELEGATE);
}

function isSideBarItem(items: string[] | ICategoryNode[]): boolean {
  return Array.isArray(items) && typeof items[0] === 'object' && items[0] !== null && 'type' in items[0];
}

function extractCustomTags(tags: Record<string, unknown[]>, parentAPIItem: ApiItem): void {
  if (!parentAPIItem.members) return;

  for (const apiItem of parentAPIItem.members) {
    switch (apiItem.kind) {
      case ApiItemKind.Package:
        extractCustomTags(tags, apiItem);
        break;
      case ApiItemKind.EntryPoint:
        extractCustomTags(tags, apiItem);
        break;
      default:
        const j: ApiDocumentedItem = apiItem as ApiDocumentedItem;

        for (const node of j.tsdocComment?.customBlocks || []) {
          if (!tags[node.blockTag.tagName]) {
            tags[node.blockTag.tagName] = [];
          }
          for (const contentNode of node.content.nodes) {
            if (contentNode.kind === 'PlainText') {
              tags[node.blockTag.tagName].push();
            }
          }
        }
        if (j.tsdocComment?.customBlocks) {
          extractCustomTags(tags, apiItem);
        }
    }
  }
}

export function buildNavigation(
  parentNodes: unknown[],
  parentAPIItem: ApiItem,
  documenter: MarkdownDocumenterAccessor
): void {
  if (!parentAPIItem.members) return;
  for (const apiItem of parentAPIItem.members) {
    const kind: ApiItemKind = apiItem.kind;

    const id: string = `${documenter.getLinkForApiItem(apiItem)?.replace('./', '')?.replace('.md', '')}`;

    let navItem: ICategoryNode;
    switch (kind) {
      case 'EntryPoint':
        buildNavigation(parentNodes, apiItem, documenter);
        break;
      case 'Package':
      case 'Class':
      case 'Interface':
      case 'Namespace':
        navItem = {
          type: 'category',
          label: apiItem.displayName,
          collapsed: shouldCollapse(kind),
          items: [overviewNode(id)]
        };
        parentNodes.push(navItem);
        buildNavigation(navItem.items, apiItem, documenter);
        break;
      case 'EnumMember':
        // Enum members don't have their own page, so skip them.
        break;
      default:
        parentNodes.push({
          type: 'doc',
          label: apiItem.displayName,
          id
        });
        buildNavigation(parentNodes, apiItem, documenter);
    }
  }
}

function shouldCollapse(kind: ApiItemKind): boolean {
  return kind === 'Class' || kind === 'Namespace' || kind === 'Interface';
}

function overviewNode(id: string): IDocNode {
  return {
    type: 'doc',
    label: 'Overview',
    id
  };
}
