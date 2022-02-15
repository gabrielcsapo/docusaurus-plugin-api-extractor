import { TSDocConfiguration } from '@microsoft/tsdoc';
import { DocTable } from '../nodes/doc-table';
import { TableBuilder } from './interfaces';

export const initTable = (configuration: TSDocConfiguration): TableBuilder => {
  return (headerTitles: string[]): DocTable => {
    return new DocTable({
      configuration,
      headerTitles
    });
  };
};
