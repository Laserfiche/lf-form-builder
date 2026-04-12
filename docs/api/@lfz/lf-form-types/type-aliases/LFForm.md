[Documentation](../../../index.md) / [@lfz/lf-form-types](../index.md) / LFForm

# Type Alias: LFForm\<FieldType\>

> **LFForm**\<`FieldType`\> = `LFFormProperties` & [`LFFormGetterApi`](LFFormGetterApi.md)\<`FieldType`\> & [`LFFormMethodApi`](LFFormMethodApi.md)\<`FieldType`\> & [`LFFormEventApi`](LFFormEventApi.md)

Defined in: LFForm/index.ts:18

Represents the full LFForm runtime API.

## Type Parameters

### FieldType

`FieldType` *extends* [`LFFormFieldRef`](LFFormFieldRef.md) = [`LFFormFieldRef`](LFFormFieldRef.md)

The typed field reference used by getter/setter/method APIs.
