import {
  MarkdownDocumenterFeature,
  IMarkdownDocumenterFeatureOnBeforeWritePageArgs,
  MarkdownDocumenterAccessor,
} from '@microsoft/api-documenter';
import { ApiItem, ApiItemKind, ApiModel } from '@microsoft/api-extractor-model';
import fs from 'fs';
import ejs from 'ejs';
import { EOL } from 'os';
import { writeFileSync } from 'fs';
import prettier from 'prettier';
import { parse, join, sep } from 'path';
import { CategoryNode, DocNode } from './interfaces';

const sidebar = fs.readFileSync(join(__dirname, './api-sidebar.ejs'), 'utf-8');
const tree = fs.readFileSync(
  join(__dirname, './api-sidebar-tree.ejs'),
  'utf-8'
);
const sidebarTmpl = ejs.compile(sidebar);
const treeTmpl = ejs.compile(tree);

const TITLE_REGEX = /## (.*)/;
export class DocusaurusFeature extends MarkdownDocumenterFeature {
  public onBeforeWritePage(
    eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs
  ): void {
    const { name: id } = parse(eventArgs.outputFilename);
    const headerParts: string[] = ['---', `id: ${id}`, 'hide_title: true'];

    const lines = toLines(eventArgs.pageContent);

    let foundTitle = false;
    for (const line of lines) {
      const maybeTitle = line.match(TITLE_REGEX);
      if (maybeTitle && !foundTitle) {
        const title = maybeTitle[1];
        headerParts.push(`title: ${title}`);
        foundTitle = true;
      }
    }

    if (eventArgs.outputFilename.indexOf('index.md') > -1) {
      headerParts.push('slug: /');
    }

    headerParts.push('---', '');

    eventArgs.pageContent = headerParts.join('\n') + eventArgs.pageContent;
  }

  public onFinished() {
    const navigationFile: CategoryNode[] = [];
    const packages: CategoryNode = {
      type: 'category',
      label: 'Packages',
      items: [overviewNode('index')],
      collapsed: false,
    };
    navigationFile.push(packages);

    buildNavigation(
      packages.items!,
      this.context.apiModel,
      this.context.documenter
    );

    const sidebarFile = prettier.format(
      sidebarTmpl({
        sideBarItems: navigationFile,
        dir: 'api',
        isSideBarItem,
        tree: treeTmpl,
      }),
      { parser: 'babel', singleQuote: true }
    );

    writeFileSync(
      join(this.context.outputFolder, 'api-sidebar.js'),
      sidebarFile
    );
  }
}

function isSideBarItem(items: string[] | CategoryNode[]): boolean {
  return (
    Array.isArray(items) &&
    typeof items[0] === 'object' &&
    items[0] !== null &&
    'type' in items[0]
  );
}

function toLines(content: string) {
  return content.split(EOL);
}

export function buildNavigation(
  parentNodes: unknown[],
  parentAPIItem: ApiItem,
  documenter: MarkdownDocumenterAccessor
) {
  if (!parentAPIItem.members) return;
  for (const apiItem of parentAPIItem.members) {
    const kind: ApiItemKind = apiItem.kind;

    const id = `${documenter
      .getLinkForApiItem(apiItem)
      ?.replace('./', '')
      ?.replace('.md', '')}`;

    let navItem: CategoryNode;
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
          items: [overviewNode(id)],
        };
        parentNodes.push(navItem);
        buildNavigation(navItem.items, apiItem, documenter);
        break;
      default:
        parentNodes.push({
          type: 'doc',
          label: apiItem.displayName,
          id,
        });
        buildNavigation(parentNodes, apiItem, documenter);
    }
  }
}

function shouldCollapse(kind: ApiItemKind) {
  return kind === 'Class' || kind === 'Namespace' || kind === 'Interface';
}

function overviewNode(id: string): DocNode {
  return {
    type: 'doc',
    label: 'Overview',
    id,
  };
}
