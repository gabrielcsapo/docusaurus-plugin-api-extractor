import {
  ApiClass,
  ApiDeclaredItem,
  ApiDocumentedItem,
  ApiEnum,
  ApiInterface,
  ApiItem,
  ApiItemKind,
  ApiModel,
  ApiNamespace,
  ApiPackage,
  ApiParameterListMixin,
  ApiPropertyItem,
  ApiReleaseTagMixin,
  ApiReturnTypeMixin,
  Excerpt,
  ReleaseTag
} from '@microsoft/api-extractor-model';
import { DocBlock, DocComment, DocParagraph, DocSection, StandardTags } from '@microsoft/tsdoc';
import pluralize from 'pluralize';
import { getConciseSignature, getParsedName } from '../file-naming';
import { DocHeading } from '../nodes/doc-heading';
import { DocTable } from '../nodes/doc-table';
import { DocTableRow } from '../nodes/doc-table-row';
import { ISections, NextPage } from './interfaces';
import { PrimitiveBuilders } from './primitive-builders';
import { appendSection, extractTitle, getLinkFilenameForApiItem } from './utils';

export class SectionBuilders implements ISections {
  private _b: PrimitiveBuilders;
  private _section: DocSection;
  private _next: NextPage;
  private _apiModel: ApiModel;
  public constructor(
    primitiveBuilders: PrimitiveBuilders,
    section: DocSection,
    apiModel: ApiModel,
    next: NextPage
  ) {
    this._b = primitiveBuilders;
    this._section = section;
    this._apiModel = apiModel;
    this._next = next;
  }

  public betaWarning(apiItem: ApiItem): void {
    const { _b: b } = this;
    if (ApiReleaseTagMixin.isBaseClassOf(apiItem)) {
      if (apiItem.releaseTag === ReleaseTag.Beta) {
        const betaWarning: string =
          'This API is provided as a preview for developers and may change' +
          ' based on feedback that we receive.  Do not use this API in a production environment.';
        b.noteBox([b.text(betaWarning)]);
        this._section.appendNode(b.noteBox([b.text(betaWarning)]));
      }
    }
  }

  public breadcrumb(apiItem: ApiItem): void {
    const { _section: section, _b: b } = this;
    section.appendNodeInParagraph(b.link('Home', getLinkFilenameForApiItem(this._apiModel)));

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
            b.text(' &gte; '),
            b.link(hierarchyItem.displayName, getLinkFilenameForApiItem(hierarchyItem))
          ]);
      }
    }
  }

  public classTable(apiClass: ApiClass): void {
    const { _section: section, _b: b, _next: next } = this;
    const eventsTable: DocTable = b.table(['Property', 'Modifiers', 'Type', 'Description']);

    const constructorsTable: DocTable = b.table(['Constructor', 'Modifiers', 'Description']);

    const propertiesTable: DocTable = b.table(['Property', 'Modifiers', 'Type', 'Description']);

    const methodsTable: DocTable = b.table(['Method', 'Modifiers', 'Description']);

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

  public decorators(apiItem: ApiItem): void {
    const { _section: section, _b: b } = this;
    const decoratorBlocks: DocBlock[] = [];
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment;
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

  public deprecated(apiItem: ApiItem): void {
    const { _section: section, _b: b } = this;
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment;

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

  public enumTable(apiEnum: ApiEnum): void {
    const { _section: section, _b: b } = this;
    const enumMembersTable: DocTable = b.table(['Member', 'Value', 'Description']);

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

  public heritageTypes(apiItem: ApiItem): void {
    const { _section: section, _b: b } = this;
    if (apiItem instanceof ApiDeclaredItem) {
      if (apiItem.excerpt.text.length > 0) {
        section.appendNode(b.paragraph([b.emphasis({ bold: true }, [b.text('Signature:')])]));

        section.appendNode(b.code(apiItem.getExcerptWithModifiers()));
      }

      if (apiItem instanceof ApiClass) {
        if (apiItem.extendsType) {
          const extendsParagraph: DocParagraph = b.paragraph([
            b.emphasis({ bold: true }, [b.text('Extends: ')])
          ]);

          const excerptParagraph: DocParagraph = b.excerpt(apiItem.extendsType.excerpt);

          extendsParagraph.appendNodes(excerptParagraph.nodes);

          section.appendNode(extendsParagraph);
        }

        if (apiItem.implementsTypes.length > 0) {
          const implementsParagraph: DocParagraph = b.paragraph([
            b.emphasis({ bold: true }, [b.text('Implements: ')])
          ]);

          let needsComma: boolean = false;

          for (const implementsType of apiItem.implementsTypes) {
            if (needsComma) {
              implementsParagraph.appendNode(b.text(', '));
            }

            const excerptParagraph: DocParagraph = b.excerpt(implementsType.excerpt);

            implementsParagraph.appendNodes(excerptParagraph.nodes);
            needsComma = true;
          }
          section.appendNode(implementsParagraph);
        }
      }
    }
  }

  public interfaceTable(apiInterface: ApiInterface): void {
    const { _section: section, _b: b, _next: next } = this;
    const eventsTable: DocTable = b.table(['Property', 'Type', 'Description']);
    const propertiesTable: DocTable = b.table(['Property', 'Type', 'Description']);
    const methodsTable: DocTable = b.table(['Method', 'Description']);
    for (const apiMember of apiInterface.members) {
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

  public modelTable(apiModel: ApiModel): void {
    const { _section: section, _b: b, _next: next } = this;
    const packagesTable: DocTable = b.table(['Package', 'Description']);

    for (const apiMember of apiModel.members) {
      const row: DocTableRow = b.tableRow([b.titleCell(apiMember), b.descriptionCell(apiMember)]);

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

  public packageOrNamespace(apiContainer: ApiPackage | ApiNamespace): void {
    const { _section: section, _b: b, _next: next } = this;

    const typeTables: Record<string, DocTable> = {};

    const apiMembers: ReadonlyArray<ApiItem> =
      apiContainer.kind === ApiItemKind.Package
        ? (apiContainer as ApiPackage).entryPoints[0].members
        : (apiContainer as ApiNamespace).members;

    for (const apiMember of apiMembers) {
      const row: DocTableRow = b.tableRow([
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

  public pageHeading(apiItem: ApiItem): void {
    const { _section: section, _b: b } = this;
    const scopedName: string = apiItem.getScopedNameWithinPackage();

    switch (apiItem.kind) {
      case ApiItemKind.Class:
      case ApiItemKind.Enum:
      case ApiItemKind.Interface:
      case ApiItemKind.Function:
      case ApiItemKind.TypeAlias:
        const modulePath: DocHeading | undefined = b.modulePathHeading(apiItem);

        section.appendNode(b.frameworkItemTypeHeading(apiItem));

        if (modulePath) {
          section.appendNode(modulePath);
        }

        break;
      case ApiItemKind.Method:
      case ApiItemKind.MethodSignature:
        section.appendNode(b.heading(`${scopedName} method`));
        break;
      case ApiItemKind.Constructor:
      case ApiItemKind.ConstructSignature:
        section.appendNode(b.heading(scopedName));
        break;
      case ApiItemKind.Model:
        section.appendNode(b.heading(`API Reference`));
        break;
      case ApiItemKind.Namespace:
        section.appendNode(b.heading(`${scopedName} namespace`));
        break;
      case ApiItemKind.Package:
        const unscopedPackageName: string = getParsedName(apiItem.displayName).unscopedName;
        section.appendNode(b.heading(`${unscopedPackageName} package`));
        break;
      case ApiItemKind.Property:
      case ApiItemKind.PropertySignature:
        section.appendNode(b.heading(`${scopedName} property`));
        break;
      case ApiItemKind.Variable:
        section.appendNode(b.heading(`${scopedName} variable`));
        break;
    }
  }

  public parameterTable(apiParameterListMixin: ApiParameterListMixin): void {
    const { _section: section, _b: b } = this;
    const parametersTable: DocTable = b.table(['Parameter', 'Type', 'Description']);
    for (const apiParameter of apiParameterListMixin.parameters) {
      const parameterDescription: DocSection = b.section();
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
      const returnTypeExcerpt: Excerpt = apiParameterListMixin.returnTypeExcerpt;
      section.appendNode(b.paragraph([b.emphasis({ bold: true }, [b.text('Returns:')])]));

      section.appendNode(b.excerpt(returnTypeExcerpt));
      if (apiParameterListMixin instanceof ApiDocumentedItem) {
        if (apiParameterListMixin.tsdocComment && apiParameterListMixin.tsdocComment.returnsBlock) {
          appendSection(section, apiParameterListMixin.tsdocComment.returnsBlock.content);
        }
      }
    }
  }

  public remarks(apiItem: ApiItem): void {
    const { _section: section, _b: b } = this;
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment;

      if (tsdocComment) {
        // Write the @remarks block
        if (tsdocComment.remarksBlock) {
          section.appendNode(b.heading('Remarks'));
          appendSection(section, tsdocComment.remarksBlock.content);
        }

        // Write the @example blocks
        const exampleBlocks: DocBlock[] = tsdocComment.customBlocks.filter(
          (x) => x.blockTag.tagNameWithUpperCase === StandardTags.example.tagNameWithUpperCase
        );

        let exampleNumber: number = 1;
        for (const exampleBlock of exampleBlocks) {
          const heading: string = exampleBlocks.length > 1 ? `Example ${exampleNumber}` : 'Example';

          section.appendNode(b.heading(heading));

          appendSection(section, exampleBlock.content);

          ++exampleNumber;
        }
      }
    }
  }

  public throws(apiItem: ApiItem): void {
    const { _section: section, _b: b } = this;
    if (apiItem instanceof ApiDocumentedItem) {
      const tsdocComment: DocComment | undefined = apiItem.tsdocComment;

      if (tsdocComment) {
        // Write the @throws blocks
        const throwsBlocks: DocBlock[] = tsdocComment.customBlocks.filter(
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
