import { DocNode, DocParagraph, TSDocConfiguration } from '@microsoft/tsdoc';
import { ParagraphBuilder } from './interfaces';

export const initParagraph =
  (configuration: TSDocConfiguration): ParagraphBuilder =>
  (children: DocNode[]): DocParagraph =>
    new DocParagraph({ configuration }, children);
