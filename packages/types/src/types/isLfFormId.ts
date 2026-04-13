import { LFFormId } from '../LFForm/index.js';

/**
 * Runtime type guard for checking whether a value can be used as an `LFFormId`.
 *
 * @group Types
 * @category Utilities
 */
export function isLfFormId(x: unknown): x is LFFormId {
  return typeof x === 'object' && x !== null && ('fieldId' in x || 'variableId' in x || 'variableName' in x);
}
