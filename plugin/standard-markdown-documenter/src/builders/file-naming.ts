import {
  ApiDocumentedItem,
  ApiItem,
  ApiItemKind,
  ApiParameterListMixin
} from '@microsoft/api-extractor-model';
import { DocBlock, DocNodeKind, DocParagraph, DocPlainText, DocSection } from '@microsoft/tsdoc';

const BAD_FILE_NAME_CHARS = /[^a-z0-9_\-\.]/gi;
const INVALID_NAME_CHARS = /[^A-Za-z0-9\-_\.]/;

export function getLinkFilenameForApiItem(apiItem: ApiItem): string {
  return `./${getFilenameForApiItem(apiItem)}`;
}

export function getSafeFilenameForName(name: string): string {
  return name.replace(BAD_FILE_NAME_CHARS, '_').toLowerCase();
}

export function getConciseSignature(apiItem: ApiItem): string {
  if (ApiParameterListMixin.isBaseClassOf(apiItem)) {
    return apiItem.displayName + '(' + apiItem.parameters.map((x) => x.name).join(', ') + ')';
  }
  return apiItem.displayName;
}

interface IParsedNamed {
  scope: string;
  unscopedName: string;
}

export function getParsedName(packageName: string): IParsedNamed {
  const parsedName: IParsedNamed = {
    scope: '',
    unscopedName: ''
  };

  let input = packageName;

  if (input === null || input === undefined) {
    throw new Error('The package name must not be null or undefined');
  }
  // Rule from npmjs.com:
  // "The name must be less than or equal to 214 characters. This includes the scope for scoped packages."
  if (packageName.length > 214) {
    throw new Error('The package name cannot be longer than 214 characters');
  }

  if (input[0] === '@') {
    const indexOfScopeSlash = input.indexOf('/');
    if (indexOfScopeSlash <= 0) {
      throw new Error(`Error parsing "${packageName}": The scope must be followed by a slash`);
    }
    parsedName.scope = input.substring(0, indexOfScopeSlash);
    input = input.substring(indexOfScopeSlash + 1);
  }

  parsedName.unscopedName = input;

  if (parsedName.scope === '@') {
    throw new Error(`Error parsing "${packageName}": The scope name cannot be empty`);
  }

  if (parsedName.unscopedName === '') {
    throw new Error(`The package name cannot be empty`);
  }

  if (parsedName.unscopedName[0] === '.' || parsedName.unscopedName[0] === '_') {
    throw new Error(`The package name "${packageName}" starts with an invalid character`);
  }

  const nameWithoutScopeSymbols =
    (parsedName.scope ? parsedName.scope.slice(1, -1) : '') + parsedName.unscopedName;

  const match = nameWithoutScopeSymbols.match(INVALID_NAME_CHARS);

  if (match) {
    throw new Error(`The package name "${packageName}" contains an invalid character: "${match[0]}"`);
  }

  return parsedName;
}

export function getFilenameForApiItem(apiItem: ApiItem): string {
  if (apiItem.kind === ApiItemKind.Model) {
    return 'index.md';
  }

  let baseName = '';
  for (const hierarchyItem of apiItem.getHierarchy()) {
    // For overloaded methods, add a suffix such as "MyClass.myMethod_2".
    let qualifiedName = getSafeFilenameForName(hierarchyItem.displayName);
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
  let firstNode = true;
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
  const comment = apiDocItem.tsdocComment;

  if (comment) {
    const modulePathBlock = comment.customBlocks.filter((block) => {
      return block.blockTag.tagNameWithUpperCase === '@MODULEPATH';
    });

    const buffer = extractAndCollapse(modulePathBlock);

    if (buffer !== '') return buffer;
  }

  return;
}

function extractAndCollapse(nodes: DocBlock[]): string {
  let buffer = '';

  for (const block of nodes) {
    for (const node of block.content.nodes) {
      if (node instanceof DocParagraph) {
        for (const child of node.getChildNodes()) {
          if (child instanceof DocPlainText) {
            let trimmed = child.text.trim();
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

export function extractTitle(apiDocItem: ApiDocumentedItem): string | undefined {
  const comment = apiDocItem.tsdocComment;

  if (comment) {
    const frameworkItemTypeBlock = comment.customBlocks.filter((block) => {
      return block.blockTag.tagNameWithUpperCase === '@FRAMEWORKITEMTYPE';
    });

    const buffer = extractAndCollapse(frameworkItemTypeBlock);

    if (buffer !== '') return buffer;
  }
  return;
}
