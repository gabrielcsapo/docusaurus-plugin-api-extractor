export interface DocNode {
  type: 'doc';
  label: string;
  id: string;
}

export interface CategoryNode {
  type: 'category';
  items: DocNode[];
  collapsed: boolean;
  label: string;
}
