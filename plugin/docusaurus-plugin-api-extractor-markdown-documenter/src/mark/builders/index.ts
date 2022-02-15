import {
  ApiClass,
  ApiEnum,
  ApiInterface,
  ApiItem,
  ApiModel,
  ApiNamespace,
  ApiPackage,
  ApiParameterListMixin
} from '@microsoft/api-extractor-model';
import { DocSection, TSDocConfiguration } from '@microsoft/tsdoc';
import { initBetaWarning } from './beta-warning';
import { initBreadcrumbSection } from './breadcrumb';
import { initClassTableSection } from './class-table';
import { initCodeSpan } from './code-span';
import { initDecoratorBlocks } from './decorator-blocks';
import { initDeprecatedBlock } from './deprecated-block';
import { initDescriptionCell } from './description-cell';
import { initEmphasis } from './emphasis';
import { initEnumTable } from './enum-table';
import { initFencedCode } from './fenced-code';
import { initFrameworkItemTypeHeading } from './framework-item-type-heading';
import { initHeading } from './heading';
import { initHeritageTypes } from './heritage-types';
import { initInterfaceTable } from './interface-table';
import { IBuilders, IFoundationBuilders, NextPage, SectionBuilder } from './interfaces';
import { initLink } from './link';
import { initModelTable } from './model-table';
import { initModifierCell } from './modifier-cell';
import { initModulePathCell } from './module-path-cell';
import { initModulePathHeading } from './module-path-heading';
import { initNoteBoxBuilder as initNoteBox } from './note-box';
import { initPackageOrNamespaceTables } from './package-or-namespace';
import { initPageHeading } from './page-heading';
import { initParagraph } from './paragraph';
import { initParameterTable } from './parameter-table';
import { initPropertyTypeCell } from './property-type-cell';
import { initRemarksSection } from './remarks';
import { initTable } from './table';
import { initTableCell } from './table-cell';
import { initTableRow } from './table-row';
import { initText } from './text';
import { initThrows } from './throws';
import { initTitleCell } from './title-cell';
import { initTypeExcerpt } from './type-excerpt';

export type Body = (builders: IBuilders) => void;

export type BodyBuilder = (body: Body) => DocSection;

export function createPageBuilder(
  configuration: TSDocConfiguration,
  apiModel: ApiModel,
  next: NextPage
): BodyBuilder {
  return (body: Body): DocSection => {
    const section: DocSection = new DocSection({ configuration });
    const builders: IBuilders = initializeBuilders(configuration, section, apiModel, next);

    body(builders);
    return section;
  };
}

export function initializeBuilders(
  configuration: TSDocConfiguration,
  section: DocSection,
  apiModel: ApiModel,
  next: NextPage
): IBuilders {
  const foundationalBuilders: IFoundationBuilders = {
    apiModel,
    noteBox: initNoteBox(configuration),
    emphasis: initEmphasis(configuration),
    paragraph: initParagraph(configuration),
    section() {
      return new DocSection({ configuration });
    },
    modulePathHeading: initModulePathHeading(configuration),
    frameworkItemTypeHeading: initFrameworkItemTypeHeading(configuration),
    link: initLink(configuration),
    text: initText(configuration),
    titleCell: initTitleCell(configuration),
    modiferCell: initModifierCell(configuration),
    modulePathCell: initModulePathCell(configuration),
    descriptionCell: initDescriptionCell(configuration),
    tableRow: initTableRow(configuration),
    excerpt: initTypeExcerpt(configuration, apiModel),
    tableCell: initTableCell(configuration),
    table: initTable(configuration),
    heading: initHeading(configuration),
    code: initFencedCode(configuration),
    codeSpan: initCodeSpan(configuration),
    propertyTypeCell: initPropertyTypeCell(configuration)
  };

  const parameterTable: SectionBuilder<ApiParameterListMixin> = initParameterTable(
    foundationalBuilders,
    section
  );
  const interfaceTable: SectionBuilder<ApiInterface> = initInterfaceTable(
    foundationalBuilders,
    section,
    next
  );
  const throwz: SectionBuilder<ApiItem> = initThrows(foundationalBuilders, section);
  const enumTable: SectionBuilder<ApiEnum> = initEnumTable(foundationalBuilders, section);
  const classTable: SectionBuilder<ApiClass> = initClassTableSection(foundationalBuilders, section, next);
  const heritageTypes: SectionBuilder<ApiItem> = initHeritageTypes(foundationalBuilders, section);
  const deprecated: SectionBuilder<ApiItem> = initDeprecatedBlock(foundationalBuilders, section);
  const betaWarning: SectionBuilder<ApiItem> = initBetaWarning(foundationalBuilders, section);
  const pageHeading: SectionBuilder<ApiItem> = initPageHeading(foundationalBuilders, section);
  const breadcrumb: SectionBuilder = initBreadcrumbSection(foundationalBuilders, section);
  const modelTable: SectionBuilder = initModelTable(foundationalBuilders, section, next);
  const remarks: SectionBuilder<ApiItem> = initRemarksSection(foundationalBuilders, section);
  const packageOrNamespace: SectionBuilder<ApiPackage | ApiNamespace> = initPackageOrNamespaceTables(
    foundationalBuilders,
    section,
    next
  );

  const decorators: SectionBuilder<ApiItem> = initDecoratorBlocks(foundationalBuilders, section);

  return {
    ...foundationalBuilders,
    breadcrumb,
    modelTable,
    remarks,
    enumTable,
    packageOrNamespace,
    pageHeading,
    betaWarning,
    decorators,
    deprecated,
    classTable,
    interfaceTable,
    heritageTypes,
    parameterTable,
    throws: throwz
  };
}
