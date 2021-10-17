import {
  MarkdownDocumenterFeature,
  IMarkdownDocumenterFeatureOnBeforeWritePageArgs,
  IMarkdownDocumenterFeatureOnFinishedArgs
} from '@microsoft/api-documenter';

export class DocusaurusFeature extends MarkdownDocumenterFeature {
  public onInitialized(): void {
    console.log('DocusaurusFeature: onInitialized()');
  }

  public onBeforeWritePage(eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs): void {
    let header: string = '';
    if(eventArgs.outputFilename.indexOf('index.md') > -1){
      header = [
        '---',
        'slug: /',
        '---',
        ''
      ].join('\n');
    }

    eventArgs.pageContent = header + eventArgs.pageContent;
  }

  public onFinished(eventArgs: IMarkdownDocumenterFeatureOnFinishedArgs): void {
    console.log(eventArgs);
    // noop
  }
}
