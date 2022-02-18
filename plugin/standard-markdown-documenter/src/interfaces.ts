import {
  ApiCallSignature,
  ApiClass,
  ApiConstructor,
  ApiConstructSignature,
  ApiEnum,
  ApiEnumMember,
  ApiFunction,
  ApiIndexSignature,
  ApiInterface,
  ApiItem,
  ApiItemKind,
  ApiMethod,
  ApiMethodSignature,
  ApiModel,
  ApiNamespace,
  ApiPackage,
  ApiProperty,
  ApiPropertySignature,
  ApiTypeAlias,
  ApiVariable,
  Excerpt
} from '@microsoft/api-extractor-model';
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

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ParentNode = {
  label: string;
  items: ParentNode[] | ChildNode[];
  [key: string]: unknown;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ChildNode = {
  label: string;
  [key: string]: unknown;
};

export interface IVisitMeta {
  id: string;
  type: string;
}

type Visit<K, T> = (apiItem: K, meta: IVisitMeta) => T;
type VisitChild<T> = Visit<T, ChildNode>;
type VisitParent<T> = Visit<T, ParentNode>;

export type IInternalChildVisitors = {
  [k in keyof ChildVisitors]: (item: ApiItem) => void;
};

export type IInternalParentVisitors = {
  [k in keyof ParentVisitors]: (item: ApiItem) => void;
};

export type IInternalVisitor = IInternalChildVisitors & IInternalParentVisitors;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ChildVisitors = {
  [ApiItemKind.CallSignature]: VisitChild<ApiCallSignature>;
  [ApiItemKind.Constructor]: VisitChild<ApiConstructor>;
  [ApiItemKind.ConstructSignature]: VisitChild<ApiConstructSignature>;
  [ApiItemKind.Enum]: VisitChild<ApiEnum>;
  [ApiItemKind.EnumMember]: VisitChild<ApiEnumMember>;
  [ApiItemKind.Function]: VisitChild<ApiFunction>;
  [ApiItemKind.IndexSignature]: VisitChild<ApiIndexSignature>;
  [ApiItemKind.Method]: VisitChild<ApiMethod>;
  [ApiItemKind.MethodSignature]: VisitChild<ApiMethodSignature>;
  [ApiItemKind.Property]: VisitChild<ApiProperty>;
  [ApiItemKind.PropertySignature]: VisitChild<ApiPropertySignature>;
  [ApiItemKind.TypeAlias]: VisitChild<ApiTypeAlias>;
  [ApiItemKind.Variable]: VisitChild<ApiVariable>;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ParentVisitors = {
  [ApiItemKind.Class]: VisitParent<ApiClass>;
  [ApiItemKind.Interface]: VisitParent<ApiInterface>;
  [ApiItemKind.Model]: VisitParent<ApiModel>;
  [ApiItemKind.Namespace]: VisitParent<ApiNamespace>;
  [ApiItemKind.Package]: VisitParent<ApiPackage>;
};

export type Visitor = ParentVisitors & ChildVisitors;

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

/**
 * A delegate that can be used to participate in the creation of each markdown document
 * @public
 */
export interface IDocumenterDelegate {
  /**
   * The folder where we are going to write the documents to. All links will be relative to this folder.
   */
  outputFolder: string;
  /**
   * The {@link @microsoft/api-extractor-model#ApiModel | ApiModel} that we derive documentation from
   */
  apiModel: ApiModel;

  /**
   * Allows you to add your own custom tsdoc configuration. see {@link https://github.com/microsoft/tsdoc/blob/bab67532f80d731087eb167c586943e946dc8b11/tsdoc/src/configuration/TSDocConfiguration.ts#L11 | TSDocConfiguration}
   * @param configuration
   */
  configureTSDoc?(configuration: TSDocConfiguration): TSDocConfiguration;

  /**
   * Allows the implementer to handle any custom tsdoc nodes that were registered in configureTSDoc
   * @param writeCtx
   */
  writeNode?(writeCtx: IWriteNodeContext): void;

  /**
   * Used to define frontmatter for a markdown document. It is called for each new document.
   * @param fileName the name of the file being created
   * @param pageTitle the title of page being created
   */
  prepareFrontmatter?(fileName: string, pageTitle: string): YamlList;

  /**
   * Called to generate a markdown document. You are provided access to all the markdown buillders
   * @param pageContext
   */
  writePage?(pageContext: IMarkdownDelegateContext): void;
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
  /**
   * Creates a node represented a fenced off snippet of code
   * @param code a code snippet that will be in the fenced output
   * @param language the name of the langauge for the code snippet
   */
  code(code: string, language: string): DocFencedCode;
  /**
   * Creates a node for an inline snippet of code
   * @param code code snippet that will be inlined
   */
  codeSpan(code: string): DocCodeSpan;
  /**
   * Creates a table cell node specifically for the description of a member of a class or interface
   * @param apiItem {@link @microsoft/api-extractor-model#ApiItem | ApiItem}
   */
  descriptionCell(apiItem: ApiItem): DocTableCell;
  /**
   * Creates a node that represents either bold or italic text
   * @param options
   * @param children
   */
  emphasis(options: IEmphasisOptions, children: DocNode[]): DocEmphasisSpan;

  /**
   * Creates a paragraph node that contains linked references to other objects and interfaces
   * @param excerpt
   */
  excerpt(excerpt: Excerpt): DocParagraph;

  /**
   * Creates a heading based on the "@framworkItemType" annotation
   * @param apiItem {@link @microsoft/api-extractor-model#ApiItem | ApiItem}
   */
  frameworkItemTypeHeading(apiItem: ApiItem): DocHeading;
  /**
   * Creates a node that represents frontmatter written in YAML
   * @param list
   */
  frontmatter(list: YamlList): DocFrontmatter;
  /**
   * Creates a heading node for the passed string
   * @param heading
   */
  heading(heading: string): DocHeading;
  /**
   * Creates a link to a specific destination. Links will be made relative to the outputFolder
   * @param linkText
   * @param destination
   */
  link(linkText: string, destination: string): DocLinkTag;
  /**
   * Generates a table cell for a typescript modifier e.g. public / static / protected etc
   * @param apiItem {@link @microsoft/api-extractor-model#ApiItem | ApiItem}
   */
  modiferCell(apiItem: ApiItem): DocTableCell;
  /**
   * Creates a table cell based on the contents of the "@modulePath" annotation
   * @param apiItem {@link @microsoft/api-extractor-model#ApiItem | ApiItem}
   */
  modulePathCell(apiItem: ApiItem): DocTableCell;
  /**
   * Returns a level 2 heading based on the contents of the "@modulePath" annotation
   * @param apiItem {@link @microsoft/api-extractor-model#ApiItem | ApiItem}
   */
  modulePathHeading(apiItem: ApiItem): DocHeading | undefined;
  /**
   * Creates a node which will be a callout box in markdown
   * @param children
   */
  noteBox(children: DocNode[]): DocNoteBox;
  /**
   * Creates a node that represents a paragraph
   * @param children
   */
  paragraph(children: DocNode[]): DocParagraph;
  /**
   * Generates a table cell for a specific property of a class or interface
   * @param apiItem {@link @microsoft/api-extractor-model#ApiItem | ApiItem}
   */
  propertyTypeCell(apiItem: ApiItem): DocTableCell;
  /**
   * Creates a new section node
   */
  section(): DocSection;
  /**
   * Creates a node representing a table cell
   * @param children
   */
  tableCell(children: DocNode[]): DocTableCell;
  /**
   * Creates a node representing a table row
   * @param children
   */
  tableRow(children: DocTableCell[]): DocTableRow;
  /**
   * Creates a table with headings
   * @param headings
   */
  table(headings: string[]): DocTable;
  /**
   * Creates a node represting a chunk of plain text.
   * @param text
   */
  text(text: string): DocPlainText;
}

export interface ISectionBuilders {
  /**
   * Appends a table to the current section that will contain all the information about the class that is currently being documented
   */
  classTable: SectionBuilder;
  /**
   * Appends a table that will contain all the information about the interface that is currently being documented
   */
  interfaceTable: SectionBuilder;
  /**
   * Appends a section that contains all the heritage types for the given object currently being documented
   */
  heritageTypes: SectionBuilder;
  /**
   * Appends a table that contains all the information about the packages
   */
  modelTable: SectionBuilder;
  /**
   * Appends a section containing information about any decorators attached to a class
   */
  decorators: SectionBuilder;
  /**
   * Appends a section containing information about deprecated items for the object currently being documented
   */
  deprecated: SectionBuilder;
  /**
   * Appends a section containing the contents of the "@remarks" block associated with the object currently being documented
   */
  remarks: SectionBuilder;
  /**
   * Appends a section containing all members of a package or namespace
   */
  packageOrNamespace: SectionBuilder;
  /**
   * Appends the breadcrumb trail
   */
  breadcrumb: SectionBuilder;
  /**
   * Appends a heading for the object currently being documented
   */
  pageHeading: SectionBuilder;
  /**
   * Appends any warnings regarding APIs that have been annotated with "@\beta"
   */
  betaWarning: SectionBuilder;
  /**
   * Appends a table containing all the members of an enum
   */
  enumTable: SectionBuilder;
  /**
   * Appends frontmatter to the section
   */
  frontmatter: SectionBuilder;
  /**
   * Appends a table containing all the information about the parameters for the object currently being documented
   */
  parameterTable: SectionBuilder;
  /**
   * Appends information about errors that will be thrown by the object currently being documented
   */
  throws: SectionBuilder;
}
