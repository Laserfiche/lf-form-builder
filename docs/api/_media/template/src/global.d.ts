import type { LFForm } from '@lf/lf-form-types';

declare global {
  interface Window {
    LFForm: LFForm;
  }
  const LFForm: LFForm;
}
