import type { LFForm } from '@lfz/lf-form-types';

declare global {
  interface Window {
    LFForm: LFForm;
    LFC: LFCWindowNamespace;
  }
  var LFForm: LFForm;
}

