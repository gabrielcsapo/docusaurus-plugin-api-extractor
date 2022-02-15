import { ApiItem, ApiItemKind } from '@microsoft/api-extractor-model';
import { DocSection } from '@microsoft/tsdoc';
import { getParsedName } from '../file-naming';
import { DocHeading } from '../nodes/doc-heading';
import { IFoundationBuilders, SectionBuilder } from './interfaces';

export const initPageHeading = (b: IFoundationBuilders, output: DocSection): SectionBuilder<ApiItem> => {
  return (apiItem: ApiItem) => {
    const scopedName: string = apiItem.getScopedNameWithinPackage();

    switch (apiItem.kind) {
      case ApiItemKind.Class:
      case ApiItemKind.Enum:
      case ApiItemKind.Interface:
      case ApiItemKind.Function:
      case ApiItemKind.TypeAlias:
        const modulePath: DocHeading | undefined = b.modulePathHeading(apiItem);

        output.appendNode(b.frameworkItemTypeHeading(apiItem));

        if (modulePath) {
          output.appendNode(modulePath);
        }

        break;
      case ApiItemKind.Method:
      case ApiItemKind.MethodSignature:
        output.appendNode(b.heading(`${scopedName} method`));
        break;
      case ApiItemKind.Constructor:
      case ApiItemKind.ConstructSignature:
        output.appendNode(b.heading(scopedName));
        break;
      case ApiItemKind.Model:
        output.appendNode(b.heading(`API Reference`));
        break;
      case ApiItemKind.Namespace:
        output.appendNode(b.heading(`${scopedName} namespace`));
        break;
      case ApiItemKind.Package:
        const unscopedPackageName: string = getParsedName(apiItem.displayName).unscopedName;
        output.appendNode(b.heading(`${unscopedPackageName} package`));
        break;
      case ApiItemKind.Property:
      case ApiItemKind.PropertySignature:
        output.appendNode(b.heading(`${scopedName} property`));
        break;
      case ApiItemKind.Variable:
        output.appendNode(b.heading(`${scopedName} variable`));
        break;
    }
  };
};
