import { IDocNodeParameters, DocNode, DocPlainText } from '@microsoft/tsdoc';
import { CustomDocNodeKind } from './doc-types';
import { DocTableCell } from './doc-table-cell';

/**
 * Constructor parameters for {@link DocTableRow}.
 */
export interface IDocTableRowParameters extends IDocNodeParameters {}

/**
 * Represents table row, similar to an HTML `<tr>` element.
 */
export class DocTableRow extends DocNode {
  private readonly _cells: DocTableCell[];

  public constructor(parameters: IDocTableRowParameters, cells?: ReadonlyArray<DocTableCell>) {
    super(parameters);

    this._cells = [];
    if (cells) {
      for (const cell of cells) {
        this.addCell(cell);
      }
    }
  }

  /** @override */
  public get kind(): string {
    return CustomDocNodeKind.TableRow;
  }

  public get cells(): ReadonlyArray<DocTableCell> {
    return this._cells;
  }

  public addCell(cell: DocTableCell): void {
    this._cells.push(cell);
  }

  public createAndAddCell(): DocTableCell {
    const newCell = new DocTableCell({ configuration: this.configuration });
    this.addCell(newCell);
    return newCell;
  }

  public addPlainTextCell(cellContent: string): DocTableCell {
    const cell = this.createAndAddCell();
    cell.content.appendNodeInParagraph(
      new DocPlainText({
        configuration: this.configuration,
        text: cellContent
      })
    );
    return cell;
  }

  /** @override */
  protected onGetChildNodes(): ReadonlyArray<DocNode | undefined> {
    return this._cells;
  }
}
