import {
  ApiClass,
  ApiDeclaredItem,
  ApiDocumentedItem,
  ApiEnum,
  ApiItem,
  ApiItemKind,
  ApiNamespace,
  ApiPackage,
  ApiParameterListMixin,
  ApiPropertyItem,
  ApiReleaseTagMixin,
  ApiReturnTypeMixin,
  ReleaseTag
} from '@microsoft/api-extractor-model';
import { DocBlock, DocComment, DocSection, StandardTags } from '@microsoft/tsdoc';
import pluralize from 'pluralize';
import { join } from 'path';
import { DocTable } from '../nodes/doc-table';
import { IInternalDocumenterDelegate, NextPage } from '../interfaces';
import { PrimitiveBuilders } from './primitive-builders';
import {
  getConciseSignature,
  getParsedName,
  extractTitle,
  getFilenameForApiItem,
  getLinkFilenameForApiItem
} from './file-naming';

export const API_ITEM_TO_FRAMEWORK_ITEM_TYPE: WeakMap<ApiItem, string> = new WeakMap();
export const API_ITEM_TO_MODULE_PATH: WeakMap<ApiItem, string> = new WeakMap();

export class SectionBuilders {
  private _b: PrimitiveBuilders;
  private _section: DocSection;
  private _next: NextPage;
  private _apiItem: ApiItem;
  private _delegate: IInternalDocumenterDelegate;
  public constructor(
    primitiveBuilders: PrimitiveBuilders,
    section: DocSection,
    delegate: IInternalDocumenterDelegate,
    apiItem: ApiItem,
    next: NextPage
  ) {
    this._b = primitiveBuilders;
    this._section = section;
    this._next = next;
    this._delegate = delegate;
    this._apiItem = apiItem;
  }

  public betaWarning(): void {
    const { _b: b, _apiItem: apiItem } = this;
    if (ApiReleaseTagMixin.isBaseClassOf(apiItem)) {
      if (apiItem.releaseTag === ReleaseTag.Beta) {
        const betaWarning =
          'This API is provided as a preview for developers and may change' +
          ' based on feedback that we receive.  Do not use this API in a production environment.';
        this._section.appendNode(b.noteBox([b.text(betaWarning)]));
      }
    }
  }

  public breadcrumb(): void {
    const { _section: section, _b: b, _apiItem: apiItem, _delegate: delegate } = this;
    section.appendNodeInParagraph(b.link('Home', getLinkFilenameForApiItem(delegate.apiModel)));

    for (const hierarchyItem of apiItem.getHierarchy()) {
      switch (hierarchyItem.kind) {
        case ApiItemKind.Model:
        case ApiItemKind.EntryPoint:
          // We don't show the model as part of the breadcrumb because it is the root-level container.
          // We don't show the entry point because today API Extractor doesn't support multiple entry points;
          // this may change in the future.
          break;
        default:
          section.appendNodesInParagraph([
            b.text(' > '),
            b.link(hierarchyItem.displayName, getLinkFilenameForApiItem(hierarchyItem))
          ]);
      }
    }
  }

  public classTable(): void {
    const { _section: section, _b: b, _next: next, _apiItem: apiClass } = this;
    const eventsTable = b.table(['Property', 'Modifiers', 'Type', 'Description']);

    const constructorsTable = b.table(['Constructor', 'Modifiers', 'Description']);

    const propertiesTable = b.table(['Property', 'Modifiers', 'Type', 'Description']);

    const methodsTable = b.table(['Method', 'Modifiers', 'Description']);

    for (const apiMember of apiClass.members) {
      switch (apiMember.kind) {
        case ApiItemKind.Constructor: {
          constructorsTable.addRow(
            b.tableRow([b.titleCell(apiMember), b.modiferCell(apiMember), b.descriptionCell(apiMember)])
          );

          next(apiMember);
          break;
        }
        case ApiItemKind.Method: {
          methodsTable.addRow(
            b.tableRow([b.titleCell(apiMember), b.modiferCell(apiMember), b.descriptionCell(apiMember)])
          );

          next(apiMember);
          break;
        }
        case ApiItemKind.Property: {
          if ((apiMember as ApiPropertyItem).isEventProperty) {
            eventsTable.addRow(
              b.tableRow([
                b.titleCell(apiMember),
                b.modiferCell(apiMember),
                b.propertyTypeCell(apiMember),
                b.descriptionCell(apiMember)
              ])
            );
          } else {
            propertiesTable.addRow(
              b.tableRow([
                b.titleCell(apiMember),
                b.modiferCell(apiMember),
                b.propertyTypeCell(apiMember),
                b.descriptionCell(apiMember)
              ])
            );
          }

          next(apiMember);
          break;
        }
      }
    }

    if (eventsTable.rows.length > 0) {
      section.appendNode(b.heading('Events'));
      section.appendNode(eventsTable);
    }

    if (constructorsTable.rows.length > 0) {
      section.appendNode(b.heading('Constructors'));
      section.appendNode(constructorsTable);
    }

    if (propertiesTable.rows.length > 0) {
      section.appendNode(b.heading('Properties'));
      section.appendNode(propertiesTable);
    }

    if (methodsTable.rows.length > 0) {
      section.appendNode(b.heading('Methods'));
      section.appendNode(methodsTable);
    }
  }

  public decorators(): void {
    const { _section: section, _b: b, _apiItem: apiItem } = this;
    const decoratorBlocks: DocBlock[] = [];
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment = apiItem.tsdocComment;
      if (tsdocComment) {
        decoratorBlocks.push(
          ...tsdocComment.customBlocks.filter(
            (block) => block.blockTag.tagNameWithUpperCase === StandardTags.decorator.tagNameWithUpperCase
          )
        );
      }

      if (decoratorBlocks.length > 0) {
        section.appendNode(b.paragraph([b.emphasis({ bold: true }, [b.text('Decorators:')])]));

        for (const decoratorBlock of decoratorBlocks) {
          section.appendNodes(decoratorBlock.content.nodes);
        }
      }
    }
  }

  public deprecated(): void {
    const { _section: section, _b: b, _apiItem: apiItem } = this;
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment = apiItem.tsdocComment;

      if (tsdocComment) {
        if (tsdocComment.deprecatedBlock) {
          section.appendNode(
            b.noteBox([
              b.paragraph([b.text('Warning: This API is now obsolete. ')]),
              ...tsdocComment.deprecatedBlock.content.nodes
            ])
          );
        }

        appendSection(section, tsdocComment.summarySection);
      }
    }
  }

  public enumTable(): void {
    const { _section: section, _b: b, _apiItem: apiEnum } = this;
    const enumMembersTable = b.table(['Member', 'Value', 'Description']);

    if (apiEnum instanceof ApiEnum) {
      for (const apiEnumMember of apiEnum.members) {
        enumMembersTable.addRow(
          b.tableRow([
            b.tableCell([b.paragraph([b.text(getConciseSignature(apiEnumMember))])]),
            b.tableCell([b.paragraph([b.codeSpan(apiEnumMember.initializerExcerpt.text)])]),
            b.descriptionCell(apiEnumMember)
          ])
        );
      }

      if (enumMembersTable.rows.length > 0) {
        section.appendNode(b.heading('Enumeration Members'));
        section.appendNode(enumMembersTable);
      }
    }
  }

  public frontmatter(): void {
    const { _section: section, _b: b, _apiItem: apiItem, _delegate: delegate } = this;

    const outputFilename = join(delegate.outputFolder, getFilenameForApiItem(apiItem));

    const list = this._delegate.prepareFrontmatter(outputFilename, this._pageHeadingText(apiItem));

    section.appendNode(b.frontmatter(list));
  }

  public heritageTypes(): void {
    const { _section: section, _b: b, _apiItem: apiItem } = this;
    if (apiItem instanceof ApiDeclaredItem) {
      if (apiItem.excerpt.text.length > 0) {
        section.appendNode(b.paragraph([b.emphasis({ bold: true }, [b.text('Signature:')])]));

        section.appendNode(b.code(apiItem.getExcerptWithModifiers()));
      }

      if (apiItem instanceof ApiClass) {
        if (apiItem.extendsType) {
          const extendsParagraph = b.paragraph([b.emphasis({ bold: true }, [b.text('Extends: ')])]);

          const excerptParagraph = b.excerpt(apiItem.extendsType.excerpt);

          extendsParagraph.appendNodes(excerptParagraph.nodes);

          section.appendNode(extendsParagraph);
        }

        if (apiItem.implementsTypes.length > 0) {
          const implementsParagraph = b.paragraph([b.emphasis({ bold: true }, [b.text('Implements: ')])]);

          let needsComma = false;

          for (const implementsType of apiItem.implementsTypes) {
            if (needsComma) {
              implementsParagraph.appendNode(b.text(', '));
            }

            const excerptParagraph = b.excerpt(implementsType.excerpt);

            implementsParagraph.appendNodes(excerptParagraph.nodes);
            needsComma = true;
          }
          section.appendNode(implementsParagraph);
        }
      }
    }
  }

  public interfaceTable(): void {
    const { _section: section, _b: b, _next: next, _apiItem: apiItem } = this;
    const eventsTable = b.table(['Property', 'Type', 'Description']);
    const propertiesTable = b.table(['Property', 'Type', 'Description']);
    const methodsTable = b.table(['Method', 'Description']);
    for (const apiMember of apiItem.members) {
      switch (apiMember.kind) {
        case ApiItemKind.ConstructSignature:
        case ApiItemKind.MethodSignature: {
          methodsTable.addRow(b.tableRow([b.titleCell(apiMember), b.descriptionCell(apiMember)]));

          next(apiMember);
          break;
        }

        case ApiItemKind.PropertySignature: {
          if ((apiMember as ApiPropertyItem).isEventProperty) {
            eventsTable.addRow(
              b.tableRow([
                b.titleCell(apiMember),
                b.propertyTypeCell(apiMember),
                b.descriptionCell(apiMember)
              ])
            );
          } else {
            propertiesTable.addRow(
              b.tableRow([
                b.titleCell(apiMember),
                b.propertyTypeCell(apiMember),
                b.descriptionCell(apiMember)
              ])
            );
          }

          next(apiMember);
          break;
        }
      }
    }

    if (eventsTable.rows.length > 0) {
      section.appendNode(b.heading('Events'));
      section.appendNode(eventsTable);
    }

    if (propertiesTable.rows.length > 0) {
      section.appendNode(b.heading('Properties'));
      section.appendNode(propertiesTable);
    }

    if (methodsTable.rows.length > 0) {
      section.appendNode(b.heading('Methods'));
      section.appendNode(methodsTable);
    }
  }

  public modelTable(): void {
    const { _section: section, _b: b, _next: next, _delegate: delegate } = this;
    const packagesTable = b.table(['Package', 'Description']);

    for (const apiMember of delegate.apiModel.members) {
      const row = b.tableRow([b.titleCell(apiMember), b.descriptionCell(apiMember)]);

      switch (apiMember.kind) {
        case ApiItemKind.Package:
          packagesTable.addRow(row);
          next(apiMember);
          break;
      }
    }

    if (packagesTable.rows.length > 0) {
      section.appendNode(b.heading('Packages'));
      section.appendNode(packagesTable);
    }
  }

  public packageOrNamespace(): void {
    const { _section: section, _b: b, _next: next, _apiItem: apiContainer } = this;

    const typeTables: Record<string, DocTable> = {};

    const apiMembers: ReadonlyArray<ApiItem> =
      apiContainer.kind === ApiItemKind.Package
        ? (apiContainer as ApiPackage).entryPoints[0].members
        : (apiContainer as ApiNamespace).members;

    for (const apiMember of apiMembers) {
      const row = b.tableRow([
        b.titleCell(apiMember),
        b.descriptionCell(apiMember),
        b.modulePathCell(apiMember)
      ]);

      let title: string = ApiItemKind.Class;

      if (apiMember instanceof ApiDocumentedItem) {
        title = extractTitle(apiMember) ?? apiMember.kind;
      }

      title = pluralize(title);

      typeTables[title] = b.table([title, 'Description', 'Import Path']);

      typeTables[title].addRow(row);

      next(apiMember);
    }

    Object.entries(typeTables).forEach(([title, table]) => {
      if (table.rows.length > 0) {
        section.appendNode(b.heading(title));
        section.appendNode(table);
      }
    });
  }

  public pageHeading(): void {
    const { _section: section, _b: b, _apiItem: apiItem } = this;

    const heading = this._pageHeadingText(apiItem);

    section.appendNode(b.heading(heading));

    switch (apiItem.kind) {
      case ApiItemKind.Class:
      case ApiItemKind.Enum:
      case ApiItemKind.Interface:
      case ApiItemKind.Function:
      case ApiItemKind.TypeAlias:
        const modulePath = b.modulePathHeading(apiItem);

        if (modulePath) {
          API_ITEM_TO_MODULE_PATH.set(apiItem, modulePath.title.replace('Import Path: ', ''));
          section.appendNode(modulePath);
        }

        break;
    }
  }

  private _pageHeadingText(apiItem: ApiItem): string {
    const { _b: b } = this;
    const scopedName = apiItem.getScopedNameWithinPackage();

    switch (apiItem.kind) {
      case ApiItemKind.Class:
      case ApiItemKind.Enum:
      case ApiItemKind.Interface:
      case ApiItemKind.Function:
      case ApiItemKind.TypeAlias:
        const title = b.frameworkItemTypeHeading(apiItem).title;
        API_ITEM_TO_FRAMEWORK_ITEM_TYPE.set(apiItem, title);
        return title;
      case ApiItemKind.Method:
      case ApiItemKind.MethodSignature:
        return `${scopedName} method`;
      case ApiItemKind.Constructor:
      case ApiItemKind.ConstructSignature:
        return scopedName;
      case ApiItemKind.Model:
        return `API Reference`;
      case ApiItemKind.Namespace:
        return `${scopedName} namespace`;
      case ApiItemKind.Package:
        const unscopedPackageName = getParsedName(apiItem.displayName).unscopedName;
        return `${unscopedPackageName} package`;
      case ApiItemKind.Property:
      case ApiItemKind.PropertySignature:
        return `${scopedName} property`;
      case ApiItemKind.Variable:
        return `${scopedName} variable`;
      default:
        throw new Error(`${apiItem.kind} does not have a supported title`);
    }
  }

  public parameterTable(): void {
    const { _section: section, _b: b, _apiItem: apiParameterListMixin } = this;
    const parametersTable = b.table(['Parameter', 'Type', 'Description']);

    for (const apiParameter of (apiParameterListMixin as ApiParameterListMixin).parameters) {
      const parameterDescription = b.section();
      if (apiParameter.tsdocParamBlock) {
        appendSection(parameterDescription, apiParameter.tsdocParamBlock.content);
      }

      parametersTable.addRow(
        b.tableRow([
          b.tableCell([b.paragraph([b.text(apiParameter.name)])]),
          b.tableCell([b.excerpt(apiParameter.parameterTypeExcerpt)]),
          b.tableCell([...parameterDescription.nodes])
        ])
      );
    }

    if (parametersTable.rows.length > 0) {
      section.appendNode(b.heading('Parameters'));
      section.appendNode(parametersTable);
    }

    if (ApiReturnTypeMixin.isBaseClassOf(apiParameterListMixin)) {
      const returnTypeExcerpt = apiParameterListMixin.returnTypeExcerpt;
      section.appendNode(b.paragraph([b.emphasis({ bold: true }, [b.text('Returns:')])]));

      section.appendNode(b.excerpt(returnTypeExcerpt));
      if (apiParameterListMixin instanceof ApiDocumentedItem) {
        if (apiParameterListMixin.tsdocComment && apiParameterListMixin.tsdocComment.returnsBlock) {
          appendSection(section, apiParameterListMixin.tsdocComment.returnsBlock.content);
        }
      }
    }
  }

  public remarks(): void {
    const { _section: section, _b: b, _apiItem: apiItem } = this;
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment;

      if (tsdocComment) {
        // Write the @remarks block
        if (tsdocComment.remarksBlock) {
          section.appendNode(b.heading('Remarks'));
          appendSection(section, tsdocComment.remarksBlock.content);
        }

        // Write the @example blocks
        const exampleBlocks = tsdocComment.customBlocks.filter(
          (x) => x.blockTag.tagNameWithUpperCase === StandardTags.example.tagNameWithUpperCase
        );

        let exampleNumber = 1;
        for (const exampleBlock of exampleBlocks) {
          const heading: string = exampleBlocks.length > 1 ? `Example ${exampleNumber}` : 'Example';

          section.appendNode(b.heading(heading));

          appendSection(section, exampleBlock.content);

          ++exampleNumber;
        }
      }
    }
  }

  public throws(): void {
    const { _section: section, _b: b, _apiItem: apiItem } = this;
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment = apiItem.tsdocComment;

      if (tsdocComment) {
        // Write the @throws blocks
        const throwsBlocks = tsdocComment.customBlocks.filter(
          (x) => x.blockTag.tagNameWithUpperCase === StandardTags.throws.tagNameWithUpperCase
        );

        if (throwsBlocks.length > 0) {
          const heading: string = 'Exceptions';
          section.appendNode(b.heading(heading));

          for (const throwsBlock of throwsBlocks) {
            appendSection(section, throwsBlock.content);
          }
        }
      }
    }
  }
}

export function appendSection(output: DocSection, docSection: DocSection): void {
  for (const node of docSection.nodes) {
    output.appendNode(node);
  }
}
