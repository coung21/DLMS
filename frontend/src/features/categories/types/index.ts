export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CategoryCreatePayload {
  name: string;
  description?: string;
}

export interface CategoryUpdatePayload {
  name?: string;
  description?: string;
}

export interface CategoryListResponse {
  items: Category[];
  total: number;
}
