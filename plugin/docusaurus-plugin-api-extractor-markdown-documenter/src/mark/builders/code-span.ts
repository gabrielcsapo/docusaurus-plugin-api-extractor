import { DocCodeSpan, TSDocConfiguration } from '@microsoft/tsdoc';
import { CodeSpanBuilder } from './interfaces';

export const initCodeSpan =
  (configuration: TSDocConfiguration): CodeSpanBuilder =>
  (code: string) =>
    new DocCodeSpan({ configuration, code });
