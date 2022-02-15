import { IApiDocumenterPluginManifest } from '@microsoft/api-documenter';
import { newDefaultPlugin } from './DocusaurusFeature';
export { newDocusaurusMarkdownPlugin } from './DocusaurusFeature';

export const apiDocumenterPluginManifest: IApiDocumenterPluginManifest = {
  manifestVersion: 1000,
  features: [
    {
      featureName: 'docusaurus-plugin-api-extractor-markdown-documenter',
      kind: 'MarkdownDocumenterFeature',
      subclass: newDefaultPlugin()
    }
  ]
};
