import {
  MarkdownDocumenterFeature,
  IMarkdownDocumenterFeatureOnBeforeWritePageArgs,
  MarkdownDocumenterAccessor
} from '@microsoft/api-documenter';
import { ApiItem, ApiItemKind } from '@microsoft/api-extractor-model';
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

export class DocusaurusFeature extends MarkdownDocumenterFeature {
  public onBeforeWritePage(eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs): void {
    const { name: id } = parse(eventArgs.outputFilename);

    eventArgs.pageContent = toDocusaurusMarkDown(eventArgs.pageContent, id);
  }

  public onFinished(): void {
    const navigationFile: ICategoryNode[] = [];
    const packages: ICategoryNode = {
      type: 'category',
      label: 'Packages',
      items: [overviewNode('index')],
      collapsed: false
    };
    navigationFile.push(packages);

    buildNavigation(packages.items!, this.context.apiModel, this.context.documenter);

    const sidebarFile: string = prettier.format(
      sidebarTmpl({
        sideBarItems: navigationFile,
        dir: 'api',
        isSideBarItem,
        tree: treeTmpl
      }),
      { parser: 'babel', singleQuote: true }
    );

    writeFileSync(join(this.context.outputFolder, 'api-sidebar.js'), sidebarFile);
  }
}

function isSideBarItem(items: string[] | ICategoryNode[]): boolean {
  return Array.isArray(items) && typeof items[0] === 'object' && items[0] !== null && 'type' in items[0];
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
