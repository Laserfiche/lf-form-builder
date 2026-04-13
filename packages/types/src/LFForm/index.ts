/** @module LFForm */
import { LFFormEventApi } from './events.js';
import {
  LFFormFieldRef,
  LFFormGetterApi,
  LFFormId,
  LFFormIdParam,
} from './getters.js';
import { LFFormMethodApi } from './methods.js';
import { LFFormProperties } from './properties.js';

export type { LFFormId, LFFormIdParam };

/**
 * The full LFForm runtime API — the global interface for interacting with
 * Laserfiche form fields, settings, and events in JavaScript.
 *
 * Core capabilities:
 * - Read and write field values
 * - Show, hide, enable, and disable fields
 * - Change field and form settings at runtime
 * - Add and remove rows/sets in tables and collections
 * - Add and remove CSS classes on fields
 * - Query fields by predicate or identifier
 * - Validate fields
 * - Subscribe to field, form, and lookup events
 *
 * @remarks
 * - Use a shared `formFields` object and prefer `fieldId` for reliability.
 * - Await mutating methods before continuing to ensure changes are applied.
 * - Gate mutations when `isReadonly`, `isDisabled`, or `isPrint` is `true`.
 * - LFForm is not available in classic designer.
 *
 * @example
 * ```javascript
 * const formFields = {
 *   firstName: { fieldId: 10 },
 *   lastName: { fieldId: 11 },
 *   expenseTable: { fieldId: 30 },
 * };
 *
 * const name = LFForm.getFieldValues(formFields.firstName);
 * await LFForm.setFieldValues(formFields.lastName, 'Doe');
 * await LFForm.showFields(formFields.firstName);
 * await LFForm.addRow(formFields.expenseTable, 2);
 * ```
 *
 * @template FieldType - The typed field reference used by getter/setter/method APIs.
 * @group LFForm
 * @groupDescription The LFForm API for interacting with form fields, settings, and events.
 * @category LFForm API
 */
export type LFForm<FieldType extends LFFormFieldRef = LFFormFieldRef> =
  LFFormProperties &
    LFFormGetterApi<FieldType> &
    LFFormMethodApi<FieldType> &
    LFFormEventApi;
