import { Thumbnail } from './thumbnail.model';

export type NavigationConfig = {
  imageMargin: number;
  containerHeight: string;
};

export type PageInfo = {
  pages?: Thumbnail[];
  currentPage?: number;
};
