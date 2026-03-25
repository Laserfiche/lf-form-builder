export type ChangeFormSettingsType = {
  title?: string;
  description?: string;
  pagination?: Array<{
    pageId: number;
    label?: string;
    prevButton?: string;
    nextButton?: string;
  }>;
};
