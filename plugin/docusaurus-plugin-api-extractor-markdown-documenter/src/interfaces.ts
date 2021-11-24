export interface IDocNode {
  type: 'doc';
  label: string;
  id: string;
}

export interface ICategoryNode {
  type: 'category';
  items: IDocNode[];
  collapsed: boolean;
  label: string;
}
