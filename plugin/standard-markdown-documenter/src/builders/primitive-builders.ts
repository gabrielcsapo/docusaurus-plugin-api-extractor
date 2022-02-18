import {
  ApiDocumentedItem,
  ApiItem,
  ApiModel,
  ApiOptionalMixin,
  ApiPropertyItem,
  ApiReleaseTagMixin,
  ApiStaticMixin,
  Excerpt,
  ExcerptToken,
  ExcerptTokenKind,
  IResolveDeclarationReferenceResult,
  ReleaseTag
} from '@microsoft/api-extractor-model';
import {
  DocCodeSpan,
  DocFencedCode,
  DocLinkTag,
  DocNode,
  DocNodeContainer,
  DocParagraph,
  DocPlainText,
  DocSection,
  TSDocConfiguration
} from '@microsoft/tsdoc';
import { DocEmphasisSpan } from '../nodes/doc-emphasis-span';
import { DocFrontmatter } from '../nodes/doc-frontmatter';
import { DocHeading } from '../nodes/doc-heading';
import { DocNoteBox } from '../nodes/doc-notebox';
import { DocTable } from '../nodes/doc-table';
import { DocTableCell } from '../nodes/doc-table-cell';
import { DocTableRow } from '../nodes/doc-table-row';
import { IEmphasisOptions, YamlList } from '../interfaces';
import {
  appendAndMergeSection,
  extractModulePath,
  extractTitle,
  getConciseSignature,
  getLinkFilenameForApiItem
} from './file-naming';

export class PrimitiveBuilders {
  private _config: TSDocConfiguration;
  private _apiModel: ApiModel;
  public constructor(configuration: TSDocConfiguration, apiModel: ApiModel) {
    this._config = configuration;
    this._apiModel = apiModel;
  }

  public code(code: string, language: string = 'typescript'): DocFencedCode {
    return new DocFencedCode({ configuration: this._config, code, language });
  }

  public codeSpan(code: string): DocCodeSpan {
    return new DocCodeSpan({ configuration: this._config, code });
  }

  public descriptionCell(apiItem: ApiItem): DocTableCell {
    const section: DocSection = new DocSection({ configuration: this._config });

    if (ApiReleaseTagMixin.isBaseClassOf(apiItem)) {
      if (apiItem.releaseTag === ReleaseTag.Beta) {
        section.appendNodesInParagraph([
          new DocEmphasisSpan({ configuration: this._config, bold: true, italic: true }, [
            new DocPlainText({ configuration: this._config, text: '(BETA)' })
          ]),
          new DocPlainText({ configuration: this._config, text: ' ' })
        ]);
      }
    }

    if (ApiOptionalMixin.isBaseClassOf(apiItem) && apiItem.isOptional) {
      section.appendNodesInParagraph([
        new DocEmphasisSpan({ configuration: this._config, italic: true }, [
          new DocPlainText({ configuration: this._config, text: '(Optional)' })
        ]),
        new DocPlainText({ configuration: this._config, text: ' ' })
      ]);
    }

    if (apiItem instanceof ApiDocumentedItem) {
      if (apiItem.tsdocComment !== undefined) {
        appendAndMergeSection(section, apiItem.tsdocComment.summarySection);
      }
    }

    return new DocTableCell({ configuration: this._config }, section.nodes);
  }

  public emphasis(options: IEmphasisOptions, children: DocNode[]): DocEmphasisSpan {
    return new DocEmphasisSpan({ configuration: this._config, ...options }, children);
  }

  public excerpt(excerpt: Excerpt): DocParagraph {
    const paragraph: DocParagraph = new DocParagraph({ configuration: this._config });

    if (!excerpt.text.trim()) {
      paragraph.appendNode(new DocPlainText({ configuration: this._config, text: '(not declared)' }));
    } else {
      this._appendExcerptWithHyperlinks(paragraph, excerpt);
    }

    return paragraph;
  }

  public frameworkItemTypeHeading(apiItem: ApiItem): DocHeading {
    let title: string = apiItem.kind.toLocaleLowerCase();

    const scopedName: string = apiItem.getScopedNameWithinPackage();

    if (title === 'typealias') {
      title = 'type alias';
    }

    if (apiItem instanceof ApiDocumentedItem) {
      title = extractTitle(apiItem) ?? title;
    }

    return new DocHeading({ configuration: this._config, title: `${scopedName} ${title}` });
  }

  public frontmatter(list: YamlList): DocFrontmatter {
    return new DocFrontmatter({ configuration: this._config }, list);
  }

  public heading(heading: string): DocHeading {
    return new DocHeading({ configuration: this._config, title: heading });
  }

  public link(linkText: string, destination: string): DocLinkTag {
    return new DocLinkTag({
      configuration: this._config,
      tagName: '@link',
      linkText,
      urlDestination: destination
    });
  }

  public modiferCell(apiItem: ApiItem): DocTableCell {
    const section: DocSection = new DocSection({ configuration: this._config });

    if (ApiStaticMixin.isBaseClassOf(apiItem)) {
      if (apiItem.isStatic) {
        section.appendNodeInParagraph(new DocCodeSpan({ configuration: this._config, code: 'static' }));
      }
    }

    return new DocTableCell({ configuration: this._config }, section.nodes);
  }

  public modulePathCell(apiItem: ApiItem): DocTableCell {
    const section: DocSection = new DocSection({ configuration: this._config });
    if (apiItem instanceof ApiDocumentedItem) {
      const modulePath: string = extractModulePath(apiItem) ?? '';
      section.appendNodesInParagraph([new DocPlainText({ configuration: this._config, text: modulePath })]);
    }

    return new DocTableCell({ configuration: this._config }, section.nodes);
  }

  public modulePathHeading(apiItem: ApiItem): DocHeading | undefined {
    let modulePath: string | undefined;
    if (apiItem instanceof ApiDocumentedItem) {
      modulePath = extractModulePath(apiItem);
    }

    if (modulePath) {
      return new DocHeading({ configuration: this._config, title: `Import Path: ${modulePath}`, level: 2 });
    }

    return;
  }

  public noteBox(children: DocNode[]): DocNoteBox {
    return new DocNoteBox({ configuration: this._config }, [
      new DocParagraph({ configuration: this._config }, children)
    ]);
  }

  public paragraph(children: DocNode[]): DocParagraph {
    return new DocParagraph({ configuration: this._config }, children);
  }

  public propertyTypeCell(apiItem: ApiItem): DocTableCell {
    const section: DocSection = new DocSection({ configuration: this._config });

    if (apiItem instanceof ApiPropertyItem) {
      section.appendNode(this.excerpt(apiItem.propertyTypeExcerpt));
    }

    return new DocTableCell({ configuration: this._config }, section.nodes);
  }

  public section(): DocSection {
    return new DocSection({ configuration: this._config });
  }

  public tableCell(children: DocNode[]): DocTableCell {
    return new DocTableCell({ configuration: this._config }, children);
  }

  public tableRow(children: DocTableCell[]): DocTableRow {
    return new DocTableRow({ configuration: this._config }, children);
  }

  public table(headings: string[]): DocTable {
    return new DocTable({
      configuration: this._config,
      headerTitles: headings
    });
  }

  public text(text: string): DocPlainText {
    return new DocPlainText({
      configuration: this._config,
      text
    });
  }

  public titleCell(apiItem: ApiItem): DocTableCell {
    let linkText: string = getConciseSignature(apiItem);
    if (ApiOptionalMixin.isBaseClassOf(apiItem) && apiItem.isOptional) {
      linkText += '?';
    }

    return new DocTableCell({ configuration: this._config }, [
      new DocParagraph({ configuration: this._config }, [
        new DocLinkTag({
          configuration: this._config,
          tagName: '@link',
          linkText: linkText,
          urlDestination: getLinkFilenameForApiItem(apiItem)
        })
      ])
    ]);
  }

  private _appendExcerptWithHyperlinks(docNodeContainer: DocNodeContainer, excerpt: Excerpt): void {
    for (const token of excerpt.spannedTokens) {
      this._appendExcerptTokenWithHyperlinks(docNodeContainer, token);
    }
  }

  private _appendExcerptTokenWithHyperlinks(docNodeContainer: DocNodeContainer, token: ExcerptToken): void {
    // Markdown doesn't provide a standardized syntax for hyperlinks inside code spans, so we will render
    // the type expression as DocPlainText.  Instead of creating multiple DocParagraphs, we can simply
    // discard any newlines and let the renderer do normal word-wrapping.
    const unwrappedTokenText: string = token.text.replace(/[\r\n]+/g, ' ');

    // If it's hyperlinkable, then append a DocLinkTag
    if (token.kind === ExcerptTokenKind.Reference && token.canonicalReference) {
      const apiItemResult: IResolveDeclarationReferenceResult = this._apiModel.resolveDeclarationReference(
        token.canonicalReference,
        undefined
      );

      if (apiItemResult.resolvedApiItem) {
        docNodeContainer.appendNode(
          new DocLinkTag({
            configuration: this._config,
            tagName: '@link',
            linkText: unwrappedTokenText,
            urlDestination: getLinkFilenameForApiItem(apiItemResult.resolvedApiItem)
          })
        );
        return;
      }
    }

    // Otherwise append non-hyperlinked text
    docNodeContainer.appendNode(new DocPlainText({ configuration: this._config, text: unwrappedTokenText }));
  }
}
