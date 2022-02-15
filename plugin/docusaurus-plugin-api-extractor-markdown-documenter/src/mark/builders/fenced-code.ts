import { DocFencedCode, TSDocConfiguration } from '@microsoft/tsdoc';
import { FencedCodeBuilder } from './interfaces';

export const initFencedCode =
  (configuration: TSDocConfiguration): FencedCodeBuilder =>
  (code: string, language: string = 'typescript') =>
    new DocFencedCode({ configuration, code, language });
