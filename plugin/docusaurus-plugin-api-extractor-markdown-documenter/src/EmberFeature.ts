import {
  IMarkdownDocumenterFeatureOnBeforeWritePageArgs,
  MarkdownDocumenterFeatureContext
} from '@microsoft/api-documenter';
import {
  IDocusaurusMarkdownPlugin,
  IMarkdownDelegate,
  newDocusaurusMarkdownPlugin
} from './DocusaurusFeature';

export function newEmberPlugin(): IDocusaurusMarkdownPlugin {
  const EMBER_DELEGATE: IMarkdownDelegate = {
    postProceessMarkdown(
      ctx: MarkdownDocumenterFeatureContext,
      writePageArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs
    ): string {
      return '';
    }
  };

  return newDocusaurusMarkdownPlugin(EMBER_DELEGATE);
}
