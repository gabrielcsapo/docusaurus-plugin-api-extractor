import {
  ApiCallSignature,
  ApiClass,
  ApiConstructor,
  ApiConstructSignature,
  ApiEnum,
  ApiEnumMember,
  ApiFunction,
  ApiIndexSignature,
  ApiInterface,
  ApiItem,
  ApiItemKind,
  ApiMethod,
  ApiMethodSignature,
  ApiModel,
  ApiNamespace,
  ApiPackage,
  ApiProperty,
  ApiPropertySignature,
  ApiTypeAlias,
  ApiVariable
} from '@microsoft/api-extractor-model';
import { ParentNode, ChildNode, IVisitMeta, Visitor } from './interfaces';

export class SidebarVisitor implements Visitor {
  private _visitor: Partial<Visitor>;
  public constructor(visitor: Partial<Visitor>) {
    this._visitor = visitor;
  }

  public [ApiItemKind.Class](apiItem: ApiItem, meta: IVisitMeta): ParentNode {
    const result: ParentNode | undefined = this._visitor[ApiItemKind.Class]?.(apiItem as ApiClass, meta);
    return this._containerNode(apiItem, result);
  }

  public [ApiItemKind.CallSignature](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.CallSignature]?.(
      apiItem as ApiCallSignature,
      meta
    );
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.ConstructSignature](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.ConstructSignature]?.(
      apiItem as ApiConstructSignature,
      meta
    );
    return this._terminalNode(apiItem, result);
  }
  public [ApiItemKind.Constructor](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Constructor]?.(
      apiItem as ApiConstructor,
      meta
    );
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.Enum](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Enum]?.(apiItem as ApiEnum, meta);
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.EnumMember](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.EnumMember]?.(
      apiItem as ApiEnumMember,
      meta
    );
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.Function](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Function]?.(apiItem as ApiFunction, meta);
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.IndexSignature](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.IndexSignature]?.(
      apiItem as ApiIndexSignature,
      meta
    );
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.Interface](apiItem: ApiItem, meta: IVisitMeta): ParentNode {
    const result: ParentNode | undefined = this._visitor[ApiItemKind.Interface]?.(
      apiItem as ApiInterface,
      meta
    );
    return this._containerNode(apiItem, result);
  }

  public [ApiItemKind.Method](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Method]?.(apiItem as ApiMethod, meta);
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.MethodSignature](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.MethodSignature]?.(
      apiItem as ApiMethodSignature,
      meta
    );
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.Model](apiItem: ApiItem, meta: IVisitMeta): ParentNode {
    let result: ParentNode | undefined = this._visitor.Model?.(apiItem as ApiModel, meta);
    if (!result) {
      result = {
        label: 'Packages',
        items: [{ label: 'Overview' }]
      };
    }

    return result;
  }

  public [ApiItemKind.Namespace](apiItem: ApiItem, meta: IVisitMeta): ParentNode {
    const result: ParentNode | undefined = this._visitor[ApiItemKind.Namespace]?.(
      apiItem as ApiNamespace,
      meta
    );
    return this._containerNode(apiItem, result);
  }

  public [ApiItemKind.Package](apiItem: ApiItem, meta: IVisitMeta): ParentNode {
    const result: ParentNode | undefined = this._visitor[ApiItemKind.Package]?.(apiItem as ApiPackage, meta);
    return this._containerNode(apiItem, result);
  }

  public [ApiItemKind.Property](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Property]?.(apiItem as ApiProperty, meta);
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.PropertySignature](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.PropertySignature]?.(
      apiItem as ApiPropertySignature,
      meta
    );
    return this._terminalNode(apiItem, result);
  }
  public [ApiItemKind.TypeAlias](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.TypeAlias]?.(
      apiItem as ApiTypeAlias,
      meta
    );
    return this._terminalNode(apiItem, result);
  }

  public [ApiItemKind.Variable](apiItem: ApiItem, meta: IVisitMeta): ChildNode {
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Variable]?.(apiItem as ApiVariable, meta);
    return this._terminalNode(apiItem, result);
  }

  private _terminalNode(apiItem: ApiItem, result?: ChildNode): ChildNode {
    if (!result) {
      result = {
        label: apiItem.displayName
      };
    }

    return result;
  }

  private _containerNode(apiItem: ApiItem, result?: ParentNode): ParentNode {
    if (!result) {
      result = {
        label: apiItem.displayName,
        items: [
          {
            label: 'Overview'
          }
        ]
      };
    }
    return result;
  }
}
