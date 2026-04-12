export type LFFormStepState = { id: string; name: string } | null;

export type LFFormProperties = {
  step: LFFormStepState;
  stage: LFFormStepState;
  language: string | null;
  locale: string | null;
  isCloud: boolean;
  isPreview: boolean;
  isReadonly: boolean;
  isDisabled: boolean;
  isPrint: boolean;
  isAnonymousUser: boolean;
  isDraft: boolean;
  pageURL: string;
};
