import { DocNode, DocParagraph, TSDocConfiguration } from '@microsoft/tsdoc';
import { DocNoteBox } from '../nodes/doc-notebox';
import { NoteBoxBuilder } from './interfaces';

export const initNoteBoxBuilder = (configuration: TSDocConfiguration): NoteBoxBuilder => {
  return (textNodes: DocNode[]) =>
    new DocNoteBox({ configuration }, [new DocParagraph({ configuration }, textNodes)]);
};
