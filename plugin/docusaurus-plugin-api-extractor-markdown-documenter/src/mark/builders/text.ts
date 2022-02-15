import { DocPlainText, TSDocConfiguration } from '@microsoft/tsdoc';
import { TextBuilder } from './interfaces';

export const initText =
  (configuration: TSDocConfiguration): TextBuilder =>
  (text: string) =>
    new DocPlainText({
      configuration,
      text
    });
