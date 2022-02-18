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
import { getLinkFilenameForApiItem } from './builders/file-naming';
import { API_ITEM_TO_FRAMEWORK_ITEM_TYPE } from './builders/section-builders';
import { IInternalVisitor, ParentNode, ChildNode, IVisitMeta, Visitor } from './interfaces';

export class SidebarVisitor implements IInternalVisitor {
  private _visitor: Partial<Visitor>;
  private _result: ParentNode[] = [];
  private _current: unknown[] = [];
  public constructor(visitor: Partial<Visitor>) {
    this._visitor = visitor;
  }

  public finalize(): ParentNode[] {
    return this._result;
  }

  public [ApiItemKind.Class](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ParentNode | undefined = this._visitor[ApiItemKind.Class]?.(apiItem as ApiClass, meta);
    this._pushParent(apiItem, result);
  }

  public [ApiItemKind.CallSignature](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.CallSignature]?.(
      apiItem as ApiCallSignature,
      meta
    );
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.ConstructSignature](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.ConstructSignature]?.(
      apiItem as ApiConstructSignature,
      meta
    );
    this._pushChild(apiItem, result);
  }
  public [ApiItemKind.Constructor](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Constructor]?.(
      apiItem as ApiConstructor,
      meta
    );
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.Enum](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Enum]?.(apiItem as ApiEnum, meta);
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.EnumMember](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.EnumMember]?.(
      apiItem as ApiEnumMember,
      meta
    );
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.Function](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Function]?.(apiItem as ApiFunction, meta);
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.IndexSignature](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.IndexSignature]?.(
      apiItem as ApiIndexSignature,
      meta
    );
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.Interface](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ParentNode | undefined = this._visitor[ApiItemKind.Interface]?.(
      apiItem as ApiInterface,
      meta
    );
    this._pushParent(apiItem, result);
  }

  public [ApiItemKind.Method](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Method]?.(apiItem as ApiMethod, meta);
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.MethodSignature](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.MethodSignature]?.(
      apiItem as ApiMethodSignature,
      meta
    );
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.Model](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    let result: ParentNode | undefined = this._visitor.Model?.(apiItem as ApiModel, meta);
    if (!result) {
      result = {
        label: 'Packages',
        items: [{ label: 'Overview' }]
      };
    }

    this._result.push(result);
    this._current = result.items;
  }

  public [ApiItemKind.Namespace](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ParentNode | undefined = this._visitor[ApiItemKind.Namespace]?.(
      apiItem as ApiNamespace,
      meta
    );
    this._pushParent(apiItem, result);
  }

  public [ApiItemKind.Package](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ParentNode | undefined = this._visitor[ApiItemKind.Package]?.(apiItem as ApiPackage, meta);
    this._pushParent(apiItem, result);
  }

  public [ApiItemKind.Property](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Property]?.(apiItem as ApiProperty, meta);
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.PropertySignature](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.PropertySignature]?.(
      apiItem as ApiPropertySignature,
      meta
    );
    this._pushChild(apiItem, result);
  }
  public [ApiItemKind.TypeAlias](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.TypeAlias]?.(
      apiItem as ApiTypeAlias,
      meta
    );
    this._pushChild(apiItem, result);
  }

  public [ApiItemKind.Variable](apiItem: ApiItem): void {
    const meta: IVisitMeta = this.metaFor(apiItem);
    const result: ChildNode | undefined = this._visitor[ApiItemKind.Variable]?.(apiItem as ApiVariable, meta);
    this._pushChild(apiItem, result);
  }

  public metaFor(apiItem: ApiItem): IVisitMeta {
    const id: string = `${getLinkFilenameForApiItem(apiItem).replace('./', '').replace('.md', '')}`;

    const type: string = API_ITEM_TO_FRAMEWORK_ITEM_TYPE.get(apiItem) || apiItem.displayName;

    return { id, type };
  }

  private _pushChild(apiItem: ApiItem, result?: ChildNode): void {
    if (!result) {
      result = {
        label: apiItem.displayName
      };
    }

    this._current.push(result);
  }

  private _pushParent(apiItem: ApiItem, result?: ParentNode): void {
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

    this._current.push(result);
    this._current = result.items as ParentNode[];
  }
}
