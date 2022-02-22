import { ApiItem, ApiItemKind } from '@microsoft/api-extractor-model';
import { Visitor } from 'standard-markdown-documenter';
import { ContainerNode, TerminalNode, IVisitMeta } from 'standard-markdown-documenter/dist/interfaces';

export const VISITOR: Visitor = {
  [ApiItemKind.Package](apiItem: ApiItem, meta: IVisitMeta) {
    return containerNode(apiItem, meta);
  },
  [ApiItemKind.Namespace](apiItem: ApiItem, meta: IVisitMeta) {
    return containerNode(apiItem, meta);
  },
  [ApiItemKind.Interface](apiItem: ApiItem, meta: IVisitMeta) {
    return containerNode(apiItem, meta);
  },
  [ApiItemKind.Class](apiItem: ApiItem, meta: IVisitMeta) {
    return containerNode(apiItem, meta);
  },
  [ApiItemKind.CallSignature](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },
  [ApiItemKind.ConstructSignature](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },
  [ApiItemKind.Constructor](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },
  [ApiItemKind.Enum](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.EnumMember](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.Function](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.IndexSignature](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.Method](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.Method](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.MethodSignature](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.Property](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.PropertySignature](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.TypeAlias](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.Variable](apiItem: ApiItem, meta: IVisitMeta) {
    return terminalNode(apiItem.displayName, meta.id);
  },

  [ApiItemKind.Model]() {
    return {
      type: 'category',
      label: 'Packages',
      items: [terminalNode('Overview', 'index')],
      collapsed: false
    };
  }
};

function containerNode(apiItem: ApiItem, meta: IVisitMeta): ContainerNode {
  return {
    type: 'category',
    label: apiItem.displayName,
    collapsed: shouldCollapse(apiItem.kind),
    items: [terminalNode('Overview', meta.id)]
  };
}

function terminalNode(displayName: string, id: string): TerminalNode {
  return {
    type: 'doc',
    label: displayName,
    id: id
  };
}

function shouldCollapse(kind: ApiItemKind): boolean {
  return kind === 'Class' || kind === 'Namespace' || kind === 'Interface';
}
