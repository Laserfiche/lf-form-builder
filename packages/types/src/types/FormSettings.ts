/**
 * Settings object accepted by `LFForm.changeFormSettings()` to update
 * form-level title, description, browser title, and pagination labels.
 *
 * @example
 * ```javascript
 * await LFForm.changeFormSettings({
 *   title: 'Expense Report',
 *   browserTitle: 'Expense Report | Internal',
 *   description: 'Complete all required fields.',
 *   pagination: [
 *     { pageId: 1, label: 'Request Details' },
 *     { pageId: 2, label: 'Approval', prevButton: 'Back', nextButton: 'Continue' },
 *   ],
 * });
 * ```
 */
export type LFFormChangeFormSettings = {
  /** Form title displayed at the top of the form. */
  title?: string;
  /** Updates the browser tab / window title. */
  browserTitle?: string;
  /** Form description text displayed below the title. */
  description?: string;
  /** Per-page pagination label and button overrides. */
  pagination?: Array<{
    /** Page identifier (numeric). */
    pageId: number;
    /** Display label for the page tab. */
    label?: string;
    /** Label for the "Previous" navigation button on this page. */
    prevButton?: string;
    /** Label for the "Next" navigation button on this page. */
    nextButton?: string;
  }>;
};
