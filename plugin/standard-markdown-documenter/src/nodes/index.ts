import { DocNodeKind, TSDocConfiguration } from '@microsoft/tsdoc';
import { DocEmphasisSpan } from './doc-emphasis-span';
import { DocFrontmatter, ListContainer } from './doc-frontmatter';
import { DocHeading } from './doc-heading';
import { DocNoteBox } from './doc-notebox';
import { DocTable } from './doc-table';
import { DocTableCell } from './doc-table-cell';
import { DocTableRow } from './doc-table-row';
import { CustomDocNodeKind } from './doc-types';

export class CustomDocNodes {
  private static _configuration: TSDocConfiguration | undefined;
  public static get configuration(): TSDocConfiguration {
    if (CustomDocNodes._configuration === undefined) {
      const configuration = new TSDocConfiguration();

      configuration.docNodeManager.registerDocNodes('@micrososft/api-documenter', [
        { docNodeKind: CustomDocNodeKind.EmphasisSpan, constructor: DocEmphasisSpan },
        { docNodeKind: CustomDocNodeKind.Heading, constructor: DocHeading },
        { docNodeKind: CustomDocNodeKind.NoteBox, constructor: DocNoteBox },
        { docNodeKind: CustomDocNodeKind.Table, constructor: DocTable },
        { docNodeKind: CustomDocNodeKind.TableCell, constructor: DocTableCell },
        { docNodeKind: CustomDocNodeKind.TableRow, constructor: DocTableRow },
        { docNodeKind: CustomDocNodeKind.Frontmatter, constructor: DocFrontmatter },
        { docNodeKind: CustomDocNodeKind.ListContainer, constructor: ListContainer }
      ]);

      configuration.docNodeManager.registerAllowableChildren(CustomDocNodeKind.Frontmatter, [
        CustomDocNodeKind.ListContainer
      ]);

      configuration.docNodeManager.registerAllowableChildren(CustomDocNodeKind.ListContainer, [
        DocNodeKind.PlainText,
        CustomDocNodeKind.ListContainer
      ]);

      configuration.docNodeManager.registerAllowableChildren(CustomDocNodeKind.EmphasisSpan, [
        DocNodeKind.PlainText,
        DocNodeKind.SoftBreak
      ]);

      configuration.docNodeManager.registerAllowableChildren(DocNodeKind.Section, [
        CustomDocNodeKind.Heading,
        CustomDocNodeKind.NoteBox,
        CustomDocNodeKind.Table,
        CustomDocNodeKind.Frontmatter
      ]);

      configuration.docNodeManager.registerAllowableChildren(DocNodeKind.Paragraph, [
        CustomDocNodeKind.EmphasisSpan
      ]);

      CustomDocNodes._configuration = configuration;
    }
    return CustomDocNodes._configuration;
  }

  public static set configuration(config: TSDocConfiguration) {
    CustomDocNodes._configuration = config;
  }
}
