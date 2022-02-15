import { DocNode, TSDocConfiguration } from '@microsoft/tsdoc';
import { DocTableCell } from '../nodes/doc-table-cell';
import { TableCellBuilder } from './interfaces';

export const initTableCell = (configuration: TSDocConfiguration): TableCellBuilder => {
  return (children: DocNode[]) => new DocTableCell({ configuration }, children);
};
