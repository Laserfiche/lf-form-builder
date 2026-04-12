import { LFFormId } from '../LFForm/index.js';

export function isLfFormId(x: unknown): x is LFFormId {
  return typeof x === 'object' && x !== null && ('fieldId' in x || 'variableId' in x || 'variableName' in x);
}
