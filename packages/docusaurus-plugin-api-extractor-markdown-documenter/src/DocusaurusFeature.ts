import {
  MarkdownDocumenterFeature,
  IMarkdownDocumenterFeatureOnBeforeWritePageArgs,
} from '@microsoft/api-documenter';
import { EOL } from 'os';
import { parse } from 'path';

const TITLE_REGEX = /## (.*)/;
export class DocusaurusFeature extends MarkdownDocumenterFeature {
  public onBeforeWritePage(
    eventArgs: IMarkdownDocumenterFeatureOnBeforeWritePageArgs
  ): void {
    const { name: id } = parse(eventArgs.outputFilename);
    const headerParts: string[] = ['---', `id: ${id}`, 'hide_title: true'];

    const lines = toLines(eventArgs.pageContent);

    let foundTitle = false;
    for (const line of lines) {
      const maybeTitle = line.match(TITLE_REGEX);
      if (maybeTitle && !foundTitle) {
        headerParts.push(`title: ${maybeTitle[1]}`);
        foundTitle = true;
      }
    }

    if (eventArgs.outputFilename.indexOf('index.md') > -1) {
      headerParts.push('slug: /');
    }

    headerParts.push('---', '');

    eventArgs.pageContent = headerParts.join('\n') + eventArgs.pageContent;
  }
}

function toLines(content: string) {
  return content.split(EOL);
}
