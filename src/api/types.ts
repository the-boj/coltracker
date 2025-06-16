export type Database = CategoryList & CategoryDataList;

export type CategoryDataList = Record<string, CategoryData[]>;
export type CategoryList = { categories: Category[] };

export interface Category {
  id: string;
  name: string;
  image: string;
  columns: string[];
}

export interface CategoryDataBase {
  id: string;
  name: string;
  status: "owned" | "not-owned";
  condition?: "new" | "mint" | "used" | "damaged";
  rating?: number;
}

export interface CategoryData extends CategoryDataBase {
  price?: number;
  total?: number;
  owned?: number[];
  description?: string;
}
