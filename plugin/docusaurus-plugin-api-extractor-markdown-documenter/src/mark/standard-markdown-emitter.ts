import { ApiItem, ApiModel, IResolveDeclarationReferenceResult } from '@microsoft/api-extractor-model';
import {
  DocBlockTag,
  DocCodeSpan,
  DocEscapedText,
  DocFencedCode,
  DocHtmlEndTag,
  DocHtmlStartTag,
  DocLinkTag,
  DocNode,
  DocNodeKind,
  DocNodeTransforms,
  DocParagraph,
  DocPlainText,
  DocSection,
  StringBuilder
} from '@microsoft/tsdoc';
import { IndentedWriter } from './indented-builder';
import { DocEmphasisSpan } from './nodes/doc-emphasis-span';
import { DocHeading } from './nodes/doc-heading';
import { DocNoteBox } from './nodes/doc-notebox';
import { DocTable } from './nodes/doc-table';
import { DocTableCell } from './nodes/doc-table-cell';
import { CustomDocNodeKind } from './nodes/doc-types';

interface IEmitterContext {
  writer: IndentedWriter;
  insideTable: boolean;
  boldRequested: boolean;
  italicRequested: boolean;
  writingBold: boolean;
  writingItalic: boolean;
  options: IEmitterOptions;
}

export interface IEmitterOptions {
  contextApiItem: ApiItem | undefined;
  onGetFilenameForApiItem: (apiItem: ApiItem) => string | undefined;
}

export class StandardMarkdownEmitter {
  private _apiModel: ApiModel;
  public constructor(apiModel: ApiModel) {
    this._apiModel = apiModel;
  }

  public emit(docNode: DocNode, stringBuilder: StringBuilder, options: IEmitterOptions): string {
    const writer: IndentedWriter = new IndentedWriter(stringBuilder);

    const context: IEmitterContext = {
      writer,
      insideTable: false,

      boldRequested: false,
      italicRequested: false,

      writingBold: false,
      writingItalic: false,
      options
    };

    this.writeNode(docNode, context, false);
    writer.ensureNewLine();

    return writer.toString();
  }

  protected writeNode(docNode: DocNode, context: IEmitterContext, docNodeSiblings: boolean): void {
    const { writer } = context;

    switch (docNode.kind) {
      case DocNodeKind.Section: {
        const docSection: DocSection = docNode as DocSection;
        this.writeNodes(docSection.nodes, context);
        break;
      }
      case DocNodeKind.InlineTag: {
        break;
      }

      case DocNodeKind.BlockTag: {
        const tagNode: DocBlockTag = docNode as DocBlockTag;
        console.warn('Unsupported block tag: ' + tagNode.tagName);
        break;
      }
      case DocNodeKind.Paragraph: {
        const docParagraph: DocParagraph = docNode as DocParagraph;
        const trimmedParagraph: DocParagraph = DocNodeTransforms.trimSpacesInParagraph(docParagraph);
        if (context.insideTable) {
          if (docNodeSiblings) {
            writer.write('<p>'); // TODO fix
            this.writeNodes(trimmedParagraph.nodes, context);
            writer.write('</p>');
          } else {
            // Special case:  If we are the only element inside this table cell, then we can omit the <p></p> container.
            this.writeNodes(trimmedParagraph.nodes, context);
          }
        } else {
          this.writeNodes(trimmedParagraph.nodes, context);
          writer.ensureNewLine();
          writer.writeLine();
        }
        break;
      }
      case DocNodeKind.PlainText: {
        const docPlainText: DocPlainText = docNode as DocPlainText;
        this.writePlainText(docPlainText.text, context);
        break;
      }

      case CustomDocNodeKind.NoteBox: {
        const docNoteBox: DocNoteBox = docNode as DocNoteBox;
        writer.ensureNewLine();

        writer.increaseIndent('&gte; ');

        this.writeNode(docNoteBox.content, context, false);
        writer.ensureNewLine();

        writer.decreaseIndent();

        writer.writeLine();
        break;
      }
      case CustomDocNodeKind.Heading:
        const docHeading: DocHeading = docNode as DocHeading;
        writer.ensureSkippedLine();

        let prefix: string;
        switch (docHeading.level) {
          case 1:
            prefix = '##';
            break;
          case 2:
            prefix = '###';
            break;
          case 3:
            prefix = '###';
            break;
          default:
            prefix = '####';
        }

        writer.writeLine(prefix + ' ' + docHeading.title);
        writer.writeLine();
        break;

      case DocNodeKind.HtmlStartTag:
      case DocNodeKind.HtmlEndTag: {
        const docHtmlTag: DocHtmlStartTag | DocHtmlEndTag = docNode as DocHtmlStartTag | DocHtmlEndTag;
        // write the HTML element verbatim into the output
        writer.write(docHtmlTag.emitAsHtml());
        break;
      }

      case DocNodeKind.CodeSpan: {
        const docCodeSpan: DocCodeSpan = docNode as DocCodeSpan;
        if (context.insideTable) {
          writer.write('<code>');
        } else {
          writer.write('`');
        }
        if (context.insideTable) {
          const code: string = docCodeSpan.code; // todo this.getTableEscapedText()
          const parts: string[] = code.split(/\r?\n/g);
          writer.write(parts.join('</code><br/><code>'));
        } else {
          writer.write(docCodeSpan.code);
        }
        if (context.insideTable) {
          writer.write('</code>');
        } else {
          writer.write('`');
        }
        break;
      }

      case DocNodeKind.LinkTag: {
        const docLinkTag: DocLinkTag = docNode as DocLinkTag;
        if (docLinkTag.codeDestination) {
          this.writeLinkTagWithCodeDestination(docLinkTag, context);
        } else if (docLinkTag.urlDestination) {
          this.writeLinkTagWithUrlDestination(docLinkTag, context);
        } else if (docLinkTag.linkText) {
          this.writePlainText(docLinkTag.linkText, context);
        }
        break;
      }

      case CustomDocNodeKind.EmphasisSpan: {
        const docEmphasisSpan: DocEmphasisSpan = docNode as DocEmphasisSpan;
        const oldBold: boolean = context.boldRequested;
        const oldItalic: boolean = context.italicRequested;
        context.boldRequested = docEmphasisSpan.bold;
        context.italicRequested = docEmphasisSpan.italic;
        this.writeNodes(docEmphasisSpan.nodes, context);
        context.boldRequested = oldBold;
        context.italicRequested = oldItalic;
        break;
      }

      case DocNodeKind.FencedCode: {
        const docFencedCode: DocFencedCode = docNode as DocFencedCode;
        writer.ensureNewLine();
        writer.write('```');
        writer.write(docFencedCode.language);
        writer.writeLine();
        writer.write(docFencedCode.code);
        writer.ensureNewLine();
        writer.writeLine('```');
        break;
      }
      case CustomDocNodeKind.Table:
        const docTable: DocTable = docNode as DocTable;
        // GitHub's markdown renderer chokes on tables that don't have a blank line above them,
        // whereas VS Code's renderer is totally fine with it.
        writer.ensureSkippedLine();

        context.insideTable = true;

        // Markdown table rows can have inconsistent cell counts.  Size the table based on the longest row.
        let columnCount: number = 0;
        if (docTable.header) {
          columnCount = docTable.header.cells.length;
        }
        for (const row of docTable.rows) {
          if (row.cells.length > columnCount) {
            columnCount = row.cells.length;
          }
        }

        // write the table header (which is required by Markdown)
        writer.write('| ');
        for (let i: number = 0; i < columnCount; ++i) {
          writer.write(' ');
          if (docTable.header) {
            const cell: DocTableCell | undefined = docTable.header.cells[i];
            if (cell) {
              this.writeNode(cell.content, context, false);
            }
          }
          writer.write(' |');
        }
        writer.writeLine();

        // write the divider
        writer.write('| ');
        for (let i: number = 0; i < columnCount; ++i) {
          writer.write(' --- |');
        }
        writer.writeLine();

        for (const row of docTable.rows) {
          writer.write('| ');
          for (const cell of row.cells) {
            writer.write(' ');
            this.writeNode(cell.content, context, false);
            writer.write(' |');
          }
          writer.writeLine();
        }
        writer.writeLine();

        context.insideTable = false;

        break;
      case DocNodeKind.SoftBreak: {
        if (!/^\s?$/.test(writer.peekLastCharacter())) {
          writer.write(' ');
        }
        break;
      }
      case DocNodeKind.EscapedText: {
        const docEscapedText: DocEscapedText = docNode as DocEscapedText;
        this.writePlainText(docEscapedText.decodedText, context);
        break;
      }
      default:
        throw new Error('Unsupported DocNodeKind kind: ' + docNode.kind);
    }
  }

  protected writeLinkTagWithCodeDestination(docLinkTag: DocLinkTag, context: IEmitterContext): void {
    const options: IEmitterOptions = context.options;

    const result: IResolveDeclarationReferenceResult = this._apiModel.resolveDeclarationReference(
      docLinkTag.codeDestination!,
      options.contextApiItem
    );

    if (result.resolvedApiItem) {
      const filename: string | undefined = options.onGetFilenameForApiItem(result.resolvedApiItem);

      if (filename) {
        let linkText: string = docLinkTag.linkText || '';
        if (linkText.length === 0) {
          // Generate a name such as Namespace1.Namespace2.MyClass.myMethod()
          linkText = result.resolvedApiItem.getScopedNameWithinPackage();
        }
        if (linkText.length > 0) {
          const encodedLinkText: string = linkText.replace(/\s+/g, ' ');

          context.writer.write('[');
          context.writer.write(encodedLinkText);
          context.writer.write(`](${filename!})`);
        } else {
          console.log('WARNING: Unable to determine link text');
        }
      }
    } else if (result.errorMessage) {
      console.log(
        `WARNING: Unable to resolve reference "${docLinkTag.codeDestination!.emitAsTsdoc()}": ` +
          result.errorMessage
      );
    }
  }

  protected writeLinkTagWithUrlDestination(docLinkTag: DocLinkTag, context: IEmitterContext): void {
    const linkText: string =
      docLinkTag.linkText !== undefined ? docLinkTag.linkText : docLinkTag.urlDestination!;

    const encodedLinkText: string = linkText.replace(/\s+/g, ' ');

    context.writer.write('[');
    context.writer.write(encodedLinkText);
    context.writer.write(`](${docLinkTag.urlDestination!})`);
  }
  protected writeNodes(docNodes: ReadonlyArray<DocNode>, context: IEmitterContext): void {
    for (const docNode of docNodes) {
      this.writeNode(docNode, context, docNodes.length > 1);
    }
  }

  protected writePlainText(text: string, context: IEmitterContext): void {
    const writer: IndentedWriter = context.writer;
    const parts: string[] = text.match(/^(\s*)(.*?)(\s*)$/) || [];

    writer.write(parts[1]);

    const middle: string = parts[2];

    if (middle !== '') {
      switch (writer.peekLastCharacter()) {
        case '':
        case '\n':
        case ' ':
        case '[':
        case '>':
          break;
        default:
          writer.write('<!-- -->');
          break;
      }

      if (context.boldRequested) {
        writer.write('**');
      }

      if (context.italicRequested) {
        writer.write('_');
      }

      writer.write(middle);

      if (context.italicRequested) {
        writer.write('_');
      }
      if (context.boldRequested) {
        writer.write('**');
      }
    }

    writer.write(parts[3]);
  }
}
