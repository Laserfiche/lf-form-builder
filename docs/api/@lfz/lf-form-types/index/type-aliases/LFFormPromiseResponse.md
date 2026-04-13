[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / LFFormPromiseResponse

# Type Alias: LFFormPromiseResponse

> **LFFormPromiseResponse** = \{ `success`: `true`; `error?`: `never`; \} \| \{ `success`: `false`; `error`: `string`; \}

Defined in: LFForm/methods.ts:23

Standard response returned by mutating LFForm methods.
On success: `{ success: true }`. On failure: `{ success: false, error: string }`.
