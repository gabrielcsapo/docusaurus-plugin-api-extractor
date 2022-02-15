import { DocNode, TSDocConfiguration } from '@microsoft/tsdoc';
import { DocEmphasisSpan } from '../nodes/doc-emphasis-span';
import { EmphasisBuilder, IEmphasisOptions } from './interfaces';

export const initEmphasis =
  (configuration: TSDocConfiguration): EmphasisBuilder =>
  (option: IEmphasisOptions, children: DocNode[]) =>
    new DocEmphasisSpan({ configuration, ...option }, children);
