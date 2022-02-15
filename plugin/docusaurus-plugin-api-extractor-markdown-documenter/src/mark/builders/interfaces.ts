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

export interface IEmphasisOptions {
  bold?: boolean;
  italic?: boolean;
}

export type NextPage = (apiItem: ApiItem) => void;
export type SectionBuilder<T = ApiModel> = (apiItem: T) => void;

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
  frontmatter: SectionBuilder<ApiItem>;
  parameterTable: SectionBuilder<ApiParameterListMixin>;
  throws: SectionBuilder<ApiItem>;
}
