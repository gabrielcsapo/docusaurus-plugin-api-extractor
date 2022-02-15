import { ApiClass, ApiDeclaredItem, ApiItem } from '@microsoft/api-extractor-model';
import { DocParagraph, DocSection } from '@microsoft/tsdoc';
import { IFoundationBuilders, SectionBuilder } from './interfaces';

export const initHeritageTypes = (b: IFoundationBuilders, output: DocSection): SectionBuilder<ApiItem> => {
  return (apiItem: ApiItem) => {
    if (apiItem instanceof ApiDeclaredItem) {
      if (apiItem.excerpt.text.length > 0) {
        output.appendNode(b.paragraph([b.emphasis({ bold: true }, [b.text('Signature:')])]));

        output.appendNode(b.code(apiItem.getExcerptWithModifiers()));
      }

      if (apiItem instanceof ApiClass) {
        if (apiItem.extendsType) {
          const extendsParagraph: DocParagraph = b.paragraph([
            b.emphasis({ bold: true }, [b.text('Extends: ')])
          ]);

          const excerptParagraph: DocParagraph = b.excerpt(apiItem.extendsType.excerpt);

          extendsParagraph.appendNodes(excerptParagraph.nodes);

          output.appendNode(extendsParagraph);
        }

        if (apiItem.implementsTypes.length > 0) {
          const implementsParagraph: DocParagraph = b.paragraph([
            b.emphasis({ bold: true }, [b.text('Implements: ')])
          ]);

          let needsComma: boolean = false;

          for (const implementsType of apiItem.implementsTypes) {
            if (needsComma) {
              implementsParagraph.appendNode(b.text(', '));
            }

            const excerptParagraph: DocParagraph = b.excerpt(implementsType.excerpt);

            implementsParagraph.appendNodes(excerptParagraph.nodes);
            needsComma = true;
          }
          output.appendNode(implementsParagraph);
        }
      }
    }
  };
};
