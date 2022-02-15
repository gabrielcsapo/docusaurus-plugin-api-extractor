import { TSDocConfiguration } from '@microsoft/tsdoc';
import { DocTableCell } from '../nodes/doc-table-cell';
import { DocTableRow } from '../nodes/doc-table-row';
import { TableRowBuilder } from './interfaces';

export const initTableRow = (configuration: TSDocConfiguration): TableRowBuilder => {
  return (children: DocTableCell[]) => new DocTableRow({ configuration }, children);
};
