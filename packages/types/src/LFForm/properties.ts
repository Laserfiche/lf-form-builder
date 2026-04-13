/** Current workflow step or stage identifier, or `null` when not in a workflow. */
export type LFFormStepState = { id: string; name: string } | null;

/**
 * Runtime context and metadata properties available on the LFForm object.
 *
 * @remarks
 * Gate mutations when {@link LFFormProperties.isReadonly | isReadonly},
 * {@link LFFormProperties.isDisabled | isDisabled}, or
 * {@link LFFormProperties.isPrint | isPrint} is `true`.
 * Branch behavior by step, stage, or language as needed.
 * 
 * @group LFForm
 * @category LFForm Properties
 */
export type LFFormProperties = {
  /** Current workflow step, or `null` if no step is active. */
  step: LFFormStepState;
  /** Current workflow stage, or `null` if no stage is active. */
  stage: LFFormStepState;
  /** Current form language (e.g. `"en"`), or `null` if unset. */
  language: string | null;
  /** Current form locale (e.g. `"en-US"`), or `null` if unset. */
  locale: string | null;
  /** `true` when the form is running in Laserfiche Cloud. */
  isCloud: boolean;
  /** `true` when the form is in preview mode. */
  isPreview: boolean;
  /** `true` when the form is read-only. Mutations should be gated on this flag. */
  isReadonly: boolean;
  /** `true` when the form is disabled. Mutations should be gated on this flag. */
  isDisabled: boolean;
  /** `true` when the form is in print mode. Mutations should be gated on this flag. */
  isPrint: boolean;
  /** `true` when the current user is anonymous (public submission). */
  isAnonymousUser: boolean;
  /** `true` when the form is a saved draft. */
  isDraft: boolean;
  /** Full URL of the current form page. */
  pageURL: string;
};
