import { findField } from '@/lib/findFieldByLFFormId';
import type { LFFormId, CustomHtmlField, SectionField } from '@lfz/lf-form-types';
import './modal.lfless';

export * from './modal.types';
import {
  LFFormModalSize,
  type LFFormButton,
  type LFFormModalOptions,
  type LFFormModalDetails,
  type ModalWindow,
} from './modal.types';
import {
  DEFAULT_BUTTONS,
  getSectionModalClassList,
  generateCustomHtmlModal,
  generateSectionModalSettings,
} from './modal.html';

declare const window: ModalWindow;

type ModalState = {
  name: string;
  states: {
    modalDismissed: boolean;
    blockClose: boolean;
  };
  modal: LFFormModal;
};

/**
 * LFFormModal Class
 */
export class LFFormModal {
  // Static properties
  static DEFAULT_MODAL_OPTIONS: Required<LFFormModalOptions> = {
    modalType: 'default',
    size: LFFormModalSize.default,
    allowBackdropDismiss: true,
    autoHideOnClose: true,
    showBackdrop: true,
  };

  static DEFAULT_BUTTONS: LFFormButton[] = DEFAULT_BUTTONS;

  static getModalInstance(name: string) {
    return LFFormModal.#modalStates[name]?.modal;
  }

  static #modalStates: Record<string, ModalState> = {};

  /**
   * Dismiss modal helper
   * @private
   * @preserve
   */
  static #dismissModal = async (name: string, button: string) => {
    const { modal, states } = LFFormModal.#modalStates[name];
    if (
      states.modalDismissed ||
      states.blockClose ||
      button === 'block-close'
    ) {
      states.blockClose = true;
      setTimeout(() => {
        states.blockClose = false;
      }, 0);
      return;
    }
    states.blockClose = false;
    states.modalDismissed = true;

    // Execute close handlers
    const handlers = modal.#closeHandlers[button] || [];
    for (const handler of handlers) {
      await handler();
    }

    // Auto-hide modal if enabled
    if (modal.#modalOptions.autoHideOnClose) {
      return modal.hide();
    }
  };

  // Instance properties
  private formField: CustomHtmlField | SectionField;
  private name: string;
  #modalOptions: Required<LFFormModalOptions> = {
    ...LFFormModal.DEFAULT_MODAL_OPTIONS,
  };
  #title = 'Modal Title';
  #content = 'This is the modal content';
  #buttons: LFFormButton[] = [];
  #closeHandlers: Record<string, Array<VoidFunction | (() => Promise<void>)>> =
    {};

  /**
   *
   * @param formField - Field to attach the modal to. Can be a Section or CustomHtml field
   * @param name - Name of the modal instance
   * @param {{
   *  size: 'sm' | 'default' | 'lg' | 'xl',
   *  showBackdrop: boolean,
   *  allowBackdropDismiss: boolean
   * }} modalOptions - Modal options to configure the modal
   * @example
   * ```javascript
   * const modal = new LFFormModal(formFields.modalField, {
   *   size: 'default',
   *   showBackdrop: true,
   *   allowBackdropDismiss: false,
   * });
   * // Set details without showing modal
   * modal.setDetails({
   *   title: 'Modal Title',
   *   // Ignored for Section fields
   *   content: '<div>This is the modal content that supports HTML</div>',
   *   buttons: [{
   *     label: 'Close',
   *     key: 'close',
   *     style: 'default',
   *     onClick: () => {
   *      console.log('Close button clicked');
   *     }
   *   }, {
   *     label: 'OK',
   *     key: 'ok',
   *     style: 'primary'
   *  }]
   * });
   * // Set close handlers by button key (not label)
   * modal.onClose('ok', () => {
   *  console.log('OK button clicked');
   * });
   * // Show modal
   * await modal.show();
   * ```
   * @preserve docs
   */
  constructor(
    formField: LFFormId,
    name?: string,
    modalOptions?: LFFormModalOptions,
  ) {
    this.name = name ?? `modal_${formField.fieldId}`;
    LFFormModal.#modalStates[this.name] = {
      name: this.name,
      states: {
        modalDismissed: true,
        blockClose: false,
      },
      modal: this,
    };

    // Initialize form field
    this.formField = findField<CustomHtmlField | SectionField>(formField)?.[
      formField.index ?? 0
    ];
    if (!this.formField) {
      throw new Error('Form Field not found');
    }

    // Set modal options and initialize
    this.setOptions(modalOptions ?? {});
    window.dismissModal = LFFormModal.#dismissModal;
    void this.hide();
    if (this.formField.componentType !== 'Section') {
      void LFForm.removeCSSClasses(this.formField, 'lf-modal');
    }
  }

  // Public methods

  /**
   * Show the modal
   * @returns Promise indicating the modal is shown
   */
  show = async () => {
    await this.render();
    const { states } = LFFormModal.#modalStates[this.name];
    states.modalDismissed = false;

    // Show modal based on field type
    if (this.formField.componentType === 'Section') {
      return LFForm.addCSSClasses(
        this.formField,
        getSectionModalClassList(this.#modalOptions, this.#buttons),
      );
    }
    return LFForm.removeCSSClasses(this.formField, 'invisible');
  };

  /**
   * Hide the modal
   * @returns Promise indicating the modal is hidden
   */
  hide = async () => {
    const { states } = LFFormModal.#modalStates[this.name];
    states.modalDismissed = true;

    // Hide modal based on field type
    if (this.formField.componentType === 'Section') {
      return LFForm.removeCSSClasses(
        this.formField,
        getSectionModalClassList(this.#modalOptions, this.#buttons),
      );
    }
    return LFForm.addCSSClasses(this.formField, 'invisible');
  };

  /**
   * Render or re-render the modal without hiding/showing
   * @returns Promise indicating the modal is rendered
   */
  render = () => this.#setModalHtml();

  /**
   * *
   * This method allows setting the modal's title, content, buttons, and options in one call.
   *
   * @param {{
   *   title?: string,
   *   content?: string,
   *   buttons?: LFFormButton[],
   *   modalOptions?: LFFormModalOptions
   * }} modalDetails
   * Modal Detail Properties:
   * - `title`: Sets the modal title.
   * - `content`: Sets the modal content (ignored for Section fields).
   * - `buttons`: Sets the modal buttons. If not provided, defaults to a close button.
   *   - `button.onClick` is optional and identical to `onClose(button.key, button.onClick)`.
   * - `modalOptions`: Sets the modal options. See `DEFAULT_MODAL_OPTIONS` for default values.
   *
   * @example
   * ```typescript
   * modal.setDetails({
   *   title: 'Modal Title',
   *   content: '<div>This is the modal content</div>',
   *   buttons: [
   *     { label: 'Close', key: 'close', style: 'default', onClick: () => console.log('Close clicked') },
   *     { label: 'OK', key: 'ok', style: 'primary' }
   *   ],
   *   modalOptions: { size: 'lg', showBackdrop: true }
   * });
   * ```
   */
  setDetails(modalDetails: LFFormModalDetails): void {
    const { title, content, buttons } = modalDetails;
    if (title !== undefined) this.#title = title;
    if (content !== undefined) this.#content = content;
    if (buttons !== undefined) {
      this.#buttons = buttons;
      for (const button of buttons) {
        if (button.onClick) {
          this.onClose(button.key, button.onClick);
        }
      }
    }
  }
  getDetails(): Required<LFFormModalDetails> {
    return {
      title: this.#title,
      content: this.#content,
      buttons: this.#buttons,
    };
  }
  /**
   * Set the modal options
   *
   * Merges the provided options with the current options and defaults.
   *
   * @param modalOptions - An object containing the modal options.
   *
   * - `size`: Specifies the size of the modal. Possible values are `'sm'`, `'default'`, `'lg'`, `'xl'`, or `'full'`.
   * - `modalType`: Defines the type of modal. Possible values are `'default'` or `'toggleFullScreen'`.
   * - `autoHideOnClose`: If `true`, the modal will automatically hide when closed. Defaults to `true`.
   * - `showBackdrop`: If `true`, a backdrop will be displayed behind the modal. Defaults to `true`.
   * - `allowBackdropDismiss`: If `true`, clicking on the backdrop will dismiss the modal. Defaults to `true`.
   *
   * @example
   * ```typescript
   * modal.setOptions({
   *   size: 'lg',
   *   modalType: 'default',
   *   autoHideOnClose: false,
   *   showBackdrop: true,
   *   allowBackdropDismiss: false,
   * });
   * ```
   */
  setOptions(modalOptions: LFFormModalOptions): void {
    this.#modalOptions = {
      ...LFFormModal.DEFAULT_MODAL_OPTIONS,
      ...this.#modalOptions,
      ...modalOptions,
    };
  }
  getOptions(): Required<LFFormModalOptions> {
    return { ...this.#modalOptions };
  }

  /**
   * Set close handlers by button key
   * @param button - The button key
   * @param callback - The callback function to execute on close
   */
  onClose(button: 'ok' | 'close' | string, callback: () => void) {
    const handlers = this.#closeHandlers[button] || [];
    handlers.push(callback);
    this.#closeHandlers[button] = handlers;
  }

  /**
   * Reset close handlers by button key
   * @param button - The button key (optional)
   */
  resetCloseHandlers(button?: 'ok' | 'close' | string) {
    if (button) {
      this.#closeHandlers[button] = [];
    } else {
      this.#closeHandlers = {};
    }
  }

  // Private methods

  /**
   * Update modal content
   * @private
   * @preserve
   */
  #setModalHtml = () => {
    if (this.formField.componentType === 'Section') {
      // Preserve existing behavior: force allowBackdropDismiss off for sections
      if (this.#modalOptions.allowBackdropDismiss) {
        this.#modalOptions.allowBackdropDismiss = false;
      }
      const settings = generateSectionModalSettings(
        this.name,
        this.#title,
        this.#modalOptions,
        this.#buttons,
      );
      if (!settings) return Promise.resolve();
      return LFForm.changeFieldSettings(this.formField, settings);
    }
    const modalHtml = generateCustomHtmlModal(
      this.name,
      this.#title,
      this.#content,
      this.#modalOptions,
      this.#buttons,
    );
    return LFForm.changeFieldSettings(this.formField, {
      content: modalHtml,
    });
  };
}
