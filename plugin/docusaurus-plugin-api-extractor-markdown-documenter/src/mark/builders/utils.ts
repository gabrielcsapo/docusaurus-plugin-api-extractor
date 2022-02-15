import {
  ApiDocumentedItem,
  ApiItem,
  ApiItemKind,
  ApiParameterListMixin
} from '@microsoft/api-extractor-model';
import { DocBlock, DocComment, DocNodeKind, DocParagraph, DocPlainText, DocSection } from '@microsoft/tsdoc';
import { getParsedName, getSafeFilenameForName } from '../file-naming';

export function getLinkFilenameForApiItem(apiItem: ApiItem): string {
  return `./${getFilenameForApiItem(apiItem)}`;
}

export function getFilenameForApiItem(apiItem: ApiItem): string {
  if (apiItem.kind === ApiItemKind.Model) {
    return 'index.md';
  }

  let baseName: string = '';
  for (const hierarchyItem of apiItem.getHierarchy()) {
    // For overloaded methods, add a suffix such as "MyClass.myMethod_2".
    let qualifiedName: string = getSafeFilenameForName(hierarchyItem.displayName);
    if (ApiParameterListMixin.isBaseClassOf(hierarchyItem)) {
      if (hierarchyItem.overloadIndex > 1) {
        // Subtract one for compatibility with earlier releases of API Documenter.
        // (This will get revamped when we fix GitHub issue #1308)
        qualifiedName += `_${hierarchyItem.overloadIndex - 1}`;
      }
    }

    switch (hierarchyItem.kind) {
      case ApiItemKind.Model:
      case ApiItemKind.EntryPoint:
      case ApiItemKind.EnumMember:
        break;
      case ApiItemKind.Package:
        baseName = getSafeFilenameForName(getParsedName(hierarchyItem.displayName).unscopedName);
        break;
      default:
        baseName += '.' + qualifiedName;
    }
  }
  return baseName + '.md';
}

export function appendAndMergeSection(output: DocSection, docSection: DocSection): void {
  let firstNode: boolean = true;
  for (const node of docSection.nodes) {
    if (firstNode) {
      if (node.kind === DocNodeKind.Paragraph) {
        output.appendNodesInParagraph(node.getChildNodes());
        firstNode = false;
        continue;
      }
    }
    firstNode = false;

    output.appendNode(node);
  }
}

export function extractModulePath(apiDocItem: ApiDocumentedItem): string | undefined {
  const comment: DocComment | undefined = apiDocItem.tsdocComment;

  if (comment) {
    const modulePathBlock: DocBlock[] = comment.customBlocks.filter((block) => {
      return block.blockTag.tagNameWithUpperCase === '@MODULEPATH';
    });

    const buffer: string = extractAndCollapse(modulePathBlock);

    if (buffer !== '') return buffer;
  }

  return;
}

function extractAndCollapse(nodes: DocBlock[]): string {
  let buffer: string = '';

  for (const block of nodes) {
    for (const node of block.content.nodes) {
      if (node instanceof DocParagraph) {
        for (const child of node.getChildNodes()) {
          if (child instanceof DocPlainText) {
            let trimmed: string = child.text.trim();
            if (trimmed[0] === '-') {
              trimmed = trimmed.substring(1).trim();
            }

            if (trimmed !== '\n') {
              if (buffer.length > 0 && buffer[buffer.length - 1] !== ' ') {
                buffer += ` ${trimmed}`;
              } else {
                buffer += trimmed;
              }
            }
          }
        }
      }
    }
  }

  return buffer;
}

export function appendSection(output: DocSection, docSection: DocSection): void {
  for (const node of docSection.nodes) {
    output.appendNode(node);
  }
}

export function extractTitle(apiDocItem: ApiDocumentedItem): string | undefined {
  const comment: DocComment | undefined = apiDocItem.tsdocComment;

  if (comment) {
    const frameworkItemTypeBlock: DocBlock[] = comment.customBlocks.filter((block) => {
      return block.blockTag.tagNameWithUpperCase === '@FRAMEWORKITEMTYPE';
    });

    const buffer: string = extractAndCollapse(frameworkItemTypeBlock);

    if (buffer !== '') return buffer;
  }
  return;
}
