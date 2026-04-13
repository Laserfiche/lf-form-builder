[Documentation](../../../index.md) / [@lfz/lf-form-builder](../index.md) / [](../README.md) / LFFormModal

# Class: LFFormModal

Defined in: packages/core/src/components/modal/index.ts:34

LFFormModal Class

## Constructors

### Constructor

> **new LFFormModal**(`formField`, `name?`, `modalOptions?`): `LFFormModal`

Defined in: packages/core/src/components/modal/index.ts:140

#### Parameters

##### formField

[`LFFormId`](../../lf-form-types/LFForm/type-aliases/LFFormId.md)

Field to attach the modal to. Can be a Section or CustomHtml field

##### name?

`string`

Name of the modal instance

##### modalOptions?

[`LFFormModalOptions`](../type-aliases/LFFormModalOptions.md)

Modal options to configure the modal

#### Returns

`LFFormModal`

#### Example

```javascript
const modal = new LFFormModal(formFields.modalField, {
  size: 'default',
  showBackdrop: true,
  allowBackdropDismiss: false,
});
// Set details without showing modal
modal.setDetails({
  title: 'Modal Title',
  // Ignored for Section fields
  content: '<div>This is the modal content that supports HTML</div>',
  buttons: [{
    label: 'Close',
    key: 'close',
    style: 'default',
    onClick: () => {
     console.log('Close button clicked');
    }
  }, {
    label: 'OK',
    key: 'ok',
    style: 'primary'
 }]
});
// Set close handlers by button key (not label)
modal.onClose('ok', () => {
 console.log('OK button clicked');
});
// Show modal
await modal.show();
```

#### Preserve

docs

## Properties

### DEFAULT\_BUTTONS

> `static` **DEFAULT\_BUTTONS**: [`LFFormButton`](../type-aliases/LFFormButton.md)[]

Defined in: packages/core/src/components/modal/index.ts:44

***

### DEFAULT\_MODAL\_OPTIONS

> `static` **DEFAULT\_MODAL\_OPTIONS**: `Required`\<[`LFFormModalOptions`](../type-aliases/LFFormModalOptions.md)\>

Defined in: packages/core/src/components/modal/index.ts:36

## Methods

### getDetails()

> **getDetails**(): `Required`\<[`LFFormModalDetails`](../type-aliases/LFFormModalDetails.md)\>

Defined in: packages/core/src/components/modal/index.ts:260

#### Returns

`Required`\<[`LFFormModalDetails`](../type-aliases/LFFormModalDetails.md)\>

***

### getOptions()

> **getOptions**(): `Required`\<[`LFFormModalOptions`](../type-aliases/LFFormModalOptions.md)\>

Defined in: packages/core/src/components/modal/index.ts:298

#### Returns

`Required`\<[`LFFormModalOptions`](../type-aliases/LFFormModalOptions.md)\>

***

### hide()

> **hide**(): `Promise`\<`LFFormPromiseResponse`\>

Defined in: packages/core/src/components/modal/index.ts:197

Hide the modal

#### Returns

`Promise`\<`LFFormPromiseResponse`\>

Promise indicating the modal is hidden

***

### onClose()

> **onClose**(`button`, `callback`): `void`

Defined in: packages/core/src/components/modal/index.ts:307

Set close handlers by button key

#### Parameters

##### button

`string`

The button key

##### callback

() => `void`

The callback function to execute on close

#### Returns

`void`

***

### render()

> **render**(): `Promise`\<`LFFormPromiseResponse`\> \| `Promise`\<`void`\>

Defined in: packages/core/src/components/modal/index.ts:215

Render or re-render the modal without hiding/showing

#### Returns

`Promise`\<`LFFormPromiseResponse`\> \| `Promise`\<`void`\>

Promise indicating the modal is rendered

***

### resetCloseHandlers()

> **resetCloseHandlers**(`button?`): `void`

Defined in: packages/core/src/components/modal/index.ts:317

Reset close handlers by button key

#### Parameters

##### button?

`string`

The button key (optional)

#### Returns

`void`

***

### setDetails()

> **setDetails**(`modalDetails`): `void`

Defined in: packages/core/src/components/modal/index.ts:247

*
This method allows setting the modal's title, content, buttons, and options in one call.

#### Parameters

##### modalDetails

[`LFFormModalDetails`](../type-aliases/LFFormModalDetails.md)

Modal Detail Properties:
- `title`: Sets the modal title.
- `content`: Sets the modal content (ignored for Section fields).
- `buttons`: Sets the modal buttons. If not provided, defaults to a close button.
  - `button.onClick` is optional and identical to `onClose(button.key, button.onClick)`.
- `modalOptions`: Sets the modal options. See `DEFAULT_MODAL_OPTIONS` for default values.

#### Returns

`void`

#### Example

```typescript
modal.setDetails({
  title: 'Modal Title',
  content: '<div>This is the modal content</div>',
  buttons: [
    { label: 'Close', key: 'close', style: 'default', onClick: () => console.log('Close clicked') },
    { label: 'OK', key: 'ok', style: 'primary' }
  ],
  modalOptions: { size: 'lg', showBackdrop: true }
});
```

***

### setOptions()

> **setOptions**(`modalOptions`): `void`

Defined in: packages/core/src/components/modal/index.ts:291

Set the modal options

Merges the provided options with the current options and defaults.

#### Parameters

##### modalOptions

[`LFFormModalOptions`](../type-aliases/LFFormModalOptions.md)

An object containing the modal options.

- `size`: Specifies the size of the modal. Possible values are `'sm'`, `'default'`, `'lg'`, `'xl'`, or `'full'`.
- `modalType`: Defines the type of modal. Possible values are `'default'` or `'toggleFullScreen'`.
- `autoHideOnClose`: If `true`, the modal will automatically hide when closed. Defaults to `true`.
- `showBackdrop`: If `true`, a backdrop will be displayed behind the modal. Defaults to `true`.
- `allowBackdropDismiss`: If `true`, clicking on the backdrop will dismiss the modal. Defaults to `true`.

#### Returns

`void`

#### Example

```typescript
modal.setOptions({
  size: 'lg',
  modalType: 'default',
  autoHideOnClose: false,
  showBackdrop: true,
  allowBackdropDismiss: false,
});
```

***

### show()

> **show**(): `Promise`\<`LFFormPromiseResponse`\>

Defined in: packages/core/src/components/modal/index.ts:178

Show the modal

#### Returns

`Promise`\<`LFFormPromiseResponse`\>

Promise indicating the modal is shown

***

### getModalInstance()

> `static` **getModalInstance**(`name`): `LFFormModal`

Defined in: packages/core/src/components/modal/index.ts:46

#### Parameters

##### name

`string`

#### Returns

`LFFormModal`
