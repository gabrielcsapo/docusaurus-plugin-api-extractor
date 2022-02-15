import {
  ApiClass,
  ApiEnum,
  ApiInterface,
  ApiItem,
  ApiModel,
  ApiNamespace,
  ApiPackage,
  ApiParameterListMixin,
  Excerpt
} from '@microsoft/api-extractor-model';
import {
  DocCodeSpan,
  DocFencedCode,
  DocLinkTag,
  DocNode,
  DocParagraph,
  DocPlainText,
  DocSection
} from '@microsoft/tsdoc';
import { DocEmphasisSpan } from '../nodes/doc-emphasis-span';
import { DocHeading } from '../nodes/doc-heading';
import { DocNoteBox } from '../nodes/doc-notebox';
import { DocTable } from '../nodes/doc-table';
import { DocTableCell } from '../nodes/doc-table-cell';
import { DocTableRow } from '../nodes/doc-table-row';

export interface IEmphasisOptions {
  bold?: boolean;
  italic?: boolean;
}

export type Builder<T> = (apiItem: ApiItem) => T;

export type PropertyTypeCellBuilder = (apiItem: ApiItem, b: IFoundationBuilders) => DocTableCell;

export type RowBody = () => DocTableCell[];

export type EmphasisBuilder = (options: IEmphasisOptions, children: DocNode[]) => DocEmphasisSpan;

export type DescriptionCellBuilder = (apiItem: ApiItem) => DocTableCell;

export type TableRowBuilder = (children: DocTableCell[]) => DocTableRow;

export type FencedCodeBuilder = (code: string, language?: string) => DocFencedCode;

export type HeadingBuilder = (title: string) => DocHeading;

export type TableBuilder = (titles: string[]) => DocTable;

export type CodeSpanBuilder = (code: string) => DocCodeSpan;

export type TableCellBuilder = (children: DocNode[]) => DocTableCell;

export type ParagraphBuilder = (children: DocNode[]) => DocParagraph;

export type NextPage = (apiItem: ApiItem) => void;

export type ExcerptBuilder = (excerpt: Excerpt) => DocParagraph;

export type TextBuilder = (text: string) => DocPlainText;

export type NoteBoxBuilder = (texts: DocNode[]) => DocNoteBox;

export type LinkBuilder = (linkText: string, destination: string) => DocLinkTag;

export type SectionBuilder<T = ApiModel> = (apiItem: T) => void;

export type IBuilders = IFoundationBuilders & ISections;

export interface IFoundationBuilders {
  apiModel: ApiModel;
  excerpt: ExcerptBuilder;
  link: LinkBuilder;
  noteBox: NoteBoxBuilder;
  modulePathHeading: Builder<DocHeading | undefined>;
  section: () => DocSection;
  descriptionCell: Builder<DocTableCell>;
  frameworkItemTypeHeading: Builder<DocHeading>;
  modulePathCell: Builder<DocTableCell>;
  titleCell: Builder<DocTableCell>;
  modiferCell: Builder<DocTableCell>;
  tableRow: TableRowBuilder;
  heading: HeadingBuilder;
  table: TableBuilder;
  tableCell: TableCellBuilder;
  text: TextBuilder;
  paragraph: ParagraphBuilder;
  emphasis: EmphasisBuilder;
  propertyTypeCell: PropertyTypeCellBuilder;
  code: FencedCodeBuilder;
  codeSpan: CodeSpanBuilder;
}

export interface ISections {
  classTable: SectionBuilder<ApiClass>;
  interfaceTable: SectionBuilder<ApiInterface>;
  heritageTypes: SectionBuilder<ApiItem>;
  modelTable: SectionBuilder;
  decorators: SectionBuilder<ApiItem>;
  deprecated: SectionBuilder<ApiItem>;
  remarks: SectionBuilder<ApiItem>;
  packageOrNamespace: SectionBuilder<ApiPackage | ApiNamespace>;
  breadcrumb: SectionBuilder;
  pageHeading: SectionBuilder<ApiItem>;
  betaWarning: SectionBuilder<ApiItem>;
  enumTable: SectionBuilder<ApiEnum>;
  parameterTable: SectionBuilder<ApiParameterListMixin>;
  throws: SectionBuilder<ApiItem>;
}
