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
 * Represents the full LFForm runtime API.
 *
 * @template FieldType - The typed field reference used by getter/setter/method APIs.
 */
export type LFForm<FieldType extends LFFormFieldRef = LFFormFieldRef> =
  LFFormProperties &
    LFFormGetterApi<FieldType> &
    LFFormMethodApi<FieldType> &
    LFFormEventApi;
