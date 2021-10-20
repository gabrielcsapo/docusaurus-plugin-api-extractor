import {
  MarkdownDocumenterFeature,
  IMarkdownDocumenterFeatureOnBeforeWritePageArgs,
} from '@microsoft/api-documenter';

export class DocusaurusFeature extends MarkdownDocumenterFeature {
  public onBeforeWritePage(
    eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs
  ): void {
    let header: string = '';
    if (eventArgs.outputFilename.indexOf('index.md') > -1) {
      header = ['---', 'slug: /', '---', ''].join('\n');
    }

    eventArgs.pageContent = header + eventArgs.pageContent;
  }
}
