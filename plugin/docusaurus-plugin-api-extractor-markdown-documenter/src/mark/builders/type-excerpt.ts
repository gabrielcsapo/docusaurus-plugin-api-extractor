import {
  ApiModel,
  Excerpt,
  ExcerptToken,
  ExcerptTokenKind,
  IResolveDeclarationReferenceResult
} from '@microsoft/api-extractor-model';
import {
  DocLinkTag,
  DocNodeContainer,
  DocParagraph,
  DocPlainText,
  TSDocConfiguration
} from '@microsoft/tsdoc';
import { ExcerptBuilder } from './interfaces';
import { getLinkFilenameForApiItem } from './utils';

export const initTypeExcerpt = (configuration: TSDocConfiguration, apiModel: ApiModel): ExcerptBuilder => {
  return (excerpt: Excerpt): DocParagraph => {
    const paragraph: DocParagraph = new DocParagraph({ configuration });

    if (!excerpt.text.trim()) {
      paragraph.appendNode(new DocPlainText({ configuration, text: '(not declared)' }));
    } else {
      appendExcerptWithHyperlinks(paragraph, excerpt);
    }

    return paragraph;
  };

  function appendExcerptWithHyperlinks(docNodeContainer: DocNodeContainer, excerpt: Excerpt): void {
    for (const token of excerpt.spannedTokens) {
      appendExcerptTokenWithHyperlinks(docNodeContainer, token);
    }
  }

  function appendExcerptTokenWithHyperlinks(docNodeContainer: DocNodeContainer, token: ExcerptToken): void {
    // Markdown doesn't provide a standardized syntax for hyperlinks inside code spans, so we will render
    // the type expression as DocPlainText.  Instead of creating multiple DocParagraphs, we can simply
    // discard any newlines and let the renderer do normal word-wrapping.
    const unwrappedTokenText: string = token.text.replace(/[\r\n]+/g, ' ');

    // If it's hyperlinkable, then append a DocLinkTag
    if (token.kind === ExcerptTokenKind.Reference && token.canonicalReference) {
      const apiItemResult: IResolveDeclarationReferenceResult = apiModel.resolveDeclarationReference(
        token.canonicalReference,
        undefined
      );

      if (apiItemResult.resolvedApiItem) {
        docNodeContainer.appendNode(
          new DocLinkTag({
            configuration,
            tagName: '@link',
            linkText: unwrappedTokenText,
            urlDestination: getLinkFilenameForApiItem(apiItemResult.resolvedApiItem)
          })
        );
        return;
      }
    }

    // Otherwise append non-hyperlinked text
    docNodeContainer.appendNode(new DocPlainText({ configuration, text: unwrappedTokenText }));
  }
};
