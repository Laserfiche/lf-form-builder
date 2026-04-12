export type LFFormChangeFormSettings = {
  title?: string;
  browserTitle?: string;
  description?: string;
  pagination?: Array<{
    pageId: number;
    label?: string;
    prevButton?: string;
    nextButton?: string;
  }>;
};
