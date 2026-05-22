import type { LFForm, LFFormId } from '@lf/lf-form-types';

type LFCSVDownloadState = {
  csvDownloadHtmlField: LFFormId;
  restoreHtmlEnabled: string;
};

declare global {
  interface Window {
    LFForm: LFForm;
    __lfCsvDownloadState?: Record<string, LFCSVDownloadState>;
    __lfAfterCsvDownload?: (key: string) => boolean;
  }
  const LFForm: LFForm;
}

