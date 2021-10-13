export type SearchResult = {
  heading?: string;
  pageNums: number[];
  sentInd?: number;
  subHeading?: string;
  text?: string;
  xmlData: {
    top: number | string;
    left: number | string;
    right: number | string;
    bottom: number | string;
    text?: string;
    _id?: string;
  }[];
};
