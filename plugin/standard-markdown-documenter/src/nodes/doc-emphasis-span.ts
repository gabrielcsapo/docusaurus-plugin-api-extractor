import { DocNode, DocNodeContainer, IDocNodeContainerParameters } from '@microsoft/tsdoc';
import { CustomDocNodeKind } from './doc-types';

export interface IDocEmphasisSpanParameters extends IDocNodeContainerParameters {
  bold?: boolean;
  italic?: boolean;
}

export class DocEmphasisSpan extends DocNodeContainer {
  public readonly bold: boolean;
  public readonly italic: boolean;

  public constructor(parameters: IDocEmphasisSpanParameters, children?: DocNode[]) {
    super(parameters, children);
    this.bold = !!parameters.bold;
    this.italic = !!parameters.italic;
  }

  /** @override */
  public get kind(): string {
    return CustomDocNodeKind.EmphasisSpan;
  }
}
