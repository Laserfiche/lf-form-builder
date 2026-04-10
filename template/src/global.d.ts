import type { LFForm } from '@lfz/lf-form-types';

type LFCWindowNamespace = Record<string, unknown>;

declare global {
  interface Window {
    LFForm: LFForm;
    LFC: LFCWindowNamespace;
  }
  const LFForm: LFForm;
}
