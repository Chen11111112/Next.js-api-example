export type Item = {
  id: number;
  title: string;
  done: boolean;
  created_at: string;
};

export type CreateItemInput = {
  title: string;
};

export type UpdateItemInput = {
  title?: string;
  done?: boolean;
};
