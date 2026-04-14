[Documentation](../../../../index.md) / [@lfz/lf-form-types](../../index.md) / [index](../index.md) / LFFormPromiseResponse

# Type Alias: LFFormPromiseResponse

> **LFFormPromiseResponse** = \{ `success`: `true`; `error?`: `never`; \} \| \{ `success`: `false`; `error`: `string`; \}

Defined in: [LFForm/methods.ts:23](https://github.com/Laserfiche/lfz-form-builder/blob/930ac99256d1304cbde6b15cdc0da8e44a4a7262/packages/types/src/LFForm/methods.ts#L23)

Standard response returned by mutating LFForm methods.
On success: `{ success: true }`. On failure: `{ success: false, error: string }`.
