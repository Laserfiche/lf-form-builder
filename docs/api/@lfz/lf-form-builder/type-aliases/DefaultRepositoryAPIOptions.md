[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / DefaultRepositoryAPIOptions

# Type Alias: DefaultRepositoryAPIOptions\<Options\>

> **DefaultRepositoryAPIOptions**\<`Options`\> = `object`

Defined in: packages/core/src/lib/api/repositoryApiHelpers.ts:41

Represents the options for the DefaultRepositoryAPI.

## Type Parameters

### Options

`Options` *extends* `Record`\<`string`, `unknown`\> = `never`

The type of additional options that are be provided by the caller function

## Properties

### apiClient?

> `optional` **apiClient?**: `RepositoryApiClient`

Defined in: packages/core/src/lib/api/repositoryApiHelpers.ts:53

API Client to pass along to caller api functions. Will default to the 'Default' client if none is passed

***

### entryIdField?

> `optional` **entryIdField?**: [`LFFormField`](../../lf-form-types/type-aliases/LFFormField.md) \| [`LFFormId`](../../lf-form-types/type-aliases/LFFormId.md) \| `string` \| `number`

Defined in: packages/core/src/lib/api/repositoryApiHelpers.ts:45

Entry ID field or value to pass along to caller api functions

***

### options

> **options**: `Options`

Defined in: packages/core/src/lib/api/repositoryApiHelpers.ts:57

The type of additional options that are be provided by the caller function

***

### repositoryId?

> `optional` **repositoryId?**: `string`

Defined in: packages/core/src/lib/api/repositoryApiHelpers.ts:49

Repository ID value to pass along to caller api functions. Will default to the first repository if only one repository exists
