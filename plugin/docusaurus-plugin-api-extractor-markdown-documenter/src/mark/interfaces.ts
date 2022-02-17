import { ApiItem, ApiModel, Excerpt } from '@microsoft/api-extractor-model';
import {
  DocCodeSpan,
  DocFencedCode,
  DocLinkTag,
  DocNode,
  DocParagraph,
  DocPlainText,
  DocSection,
  TSDocConfiguration
} from '@microsoft/tsdoc';
import { IndentedWriter } from './builders/indented-builder';
import { DocEmphasisSpan } from './nodes/doc-emphasis-span';
import { DocFrontmatter } from './nodes/doc-frontmatter';
import { DocHeading } from './nodes/doc-heading';
import { DocNoteBox } from './nodes/doc-notebox';
import { DocTable } from './nodes/doc-table';
import { DocTableCell } from './nodes/doc-table-cell';
import { DocTableRow } from './nodes/doc-table-row';

export interface IEmphasisOptions {
  bold?: boolean;
  italic?: boolean;
}

export type NextPage = (apiItem: ApiItem) => void;

export type SectionBuilder = () => void;

export interface IEmitterOptions {
  contextApiItem: ApiItem | undefined;
  onGetFilenameForApiItem: (apiItem: ApiItem) => string | undefined;
}

export type YamlList =
  | string
  | number
  | boolean
  // eslint-disable-next-line @rushstack/no-new-null
  | null
  // eslint-disable-next-line @rushstack/no-new-null
  | { [key: string]: null }
  | { [key: string]: YamlList };

export interface IDocumenterDelegate {
  outputFolder: string;
  apiModel: ApiModel;
  configureTSDoc?(configuration: TSDocConfiguration): TSDocConfiguration;
  writeNode?(writeCtx: IWriteNodeContext): void;
  prepareFrontmatter?(fileName: string, pageTitle: string): YamlList;
  writePage?(b: IMarkdownDelegateContext): void;
}

export interface IEmitterContext {
  writer: IndentedWriter;
  insideTable: boolean;
  boldRequested: boolean;
  italicRequested: boolean;
  writingBold: boolean;
  writingItalic: boolean;
  options: IEmitterOptions;
}

export interface IWriteNodeContext {
  docNode: DocNode;
  context: IEmitterContext;
  docNodeSiblings: boolean;
  writeNode(docNode: DocNode, context: IEmitterContext, docNodeSiblings: boolean): void;
}

export interface IInternalDocumenterDelegate {
  outputFolder: string;
  apiModel: ApiModel;
  configureTSDoc(configuration: TSDocConfiguration): TSDocConfiguration;
  prepareFrontmatter(fileName: string, pageTitle: string): YamlList;
  writePage(b: IMarkdownDelegateContext): void;
  writeNode(ctx: IWriteNodeContext): void;
}

export interface IMarkdownDelegateContext {
  primitives: IPrimitiveBuilders;
  sections: ISectionBuilders;
  currentPage: DocSection;
  apiItem: ApiItem;
  tsDocConfiguration: TSDocConfiguration;
  append(docNode: DocNode): void;
  next(apiItem: ApiItem): void;
}

/**
 * Responsible for building primitive pieces of a markdown document
 * @public
 */
export interface IPrimitiveBuilders {
  code(code: string, language: string): DocFencedCode;
  codeSpan(code: string): DocCodeSpan;
  descriptionCell(apiItem: ApiItem): DocTableCell;
  emphasis(options: IEmphasisOptions, children: DocNode[]): DocEmphasisSpan;
  excerpt(excerpt: Excerpt): DocParagraph;
  frameworkItemTypeHeading(apiItem: ApiItem): DocHeading;
  frontmatter(list: YamlList): DocFrontmatter;
  heading(heading: string): DocHeading;
  link(linkText: string, destination: string): DocLinkTag;
  modiferCell(apiItem: ApiItem): DocTableCell;
  modulePathCell(apiItem: ApiItem): DocTableCell;
  modulePathHeading(apiItem: ApiItem): DocHeading | undefined;
  noteBox(children: DocNode[]): DocNoteBox;
  paragraph(children: DocNode[]): DocParagraph;
  propertyTypeCell(apiItem: ApiItem): DocTableCell;
  section(): DocSection;
  tableCell(children: DocNode[]): DocTableCell;
  tableRow(children: DocTableCell[]): DocTableRow;
  table(headings: string[]): DocTable;
  text(text: string): DocPlainText;
  titleCell(apiItem: ApiItem): DocTableCell;
}

export interface ISectionBuilders {
  classTable: SectionBuilder;
  interfaceTable: SectionBuilder;
  heritageTypes: SectionBuilder;
  modelTable: SectionBuilder;
  decorators: SectionBuilder;
  deprecated: SectionBuilder;
  remarks: SectionBuilder;
  packageOrNamespace: SectionBuilder;
  breadcrumb: SectionBuilder;
  pageHeading: SectionBuilder;
  betaWarning: SectionBuilder;
  enumTable: SectionBuilder;
  frontmatter: SectionBuilder;
  parameterTable: SectionBuilder;
  throws: SectionBuilder;
}
