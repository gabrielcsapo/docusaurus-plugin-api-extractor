import { DocNodeContainer, DocPlainText, IDocNodeContainerParameters } from '@microsoft/tsdoc';
import { CustomDocNodeKind } from './doc-types';
import { YamlList } from '../interfaces';

export class ListContainer extends DocNodeContainer {
  /** @override */
  public get kind(): string {
    return CustomDocNodeKind.ListContainer;
  }
}

export class DocFrontmatter extends DocNodeContainer {
  public constructor(parameters: IDocNodeContainerParameters, list: YamlList) {
    super(parameters);
    const container: ListContainer = new ListContainer(parameters);
    this._writeList(list, parameters, container);
    this.appendNode(container);
  }

  private _writeList(
    list: YamlList,
    parameters: IDocNodeContainerParameters,
    container: ListContainer
  ): void {
    if (!list) return;

    Object.entries(list).forEach(([key, value]) => {
      if (typeof value === 'object') {
        const childContainer = new ListContainer(parameters);
        this._writeList(value, parameters, childContainer);
        container.appendNode(childContainer);
      } else {
        const text: DocPlainText = new DocPlainText({ ...parameters, text: `${key}: ${value}` });
        container.appendNode(text);
      }
    });
  }

  /** @override */
  public get kind(): string {
    return CustomDocNodeKind.Frontmatter;
  }
}
