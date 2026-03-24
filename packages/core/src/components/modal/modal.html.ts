import type { LFFormButton, LFFormModalOptions } from './modal.types';
import { LFFormButtonStyle } from './modal.types';

export const DEFAULT_BUTTONS: LFFormButton[] = [
  { label: 'Close', key: 'close', style: LFFormButtonStyle.secondary },
];

export type ModalProperties = {
  useButtons: LFFormButton[];
  allowBackdropDismiss: boolean;
  modalSize: string;
  showBackdrop: boolean;
};

/**
 * @preserve
 */
export function dismissAttr(name: string, button: string): string {
  return `onclick="window.dismissModal('${name}','${button}')"`;
}

/**
 * @preserve
 */
export function getModalProperties(
  options: Required<LFFormModalOptions>,
  buttons: LFFormButton[],
  isSection: boolean,
): ModalProperties {
  const useButtons =
    buttons.length === 0 && options.modalType === 'default'
      ? DEFAULT_BUTTONS
      : buttons;
  const modalPrefix = isSection ? 'lf-' : '';
  const modalSize =
    options.size !== 'default'
      ? `${modalPrefix}modal-${options.size}`
      : '';
  return {
    useButtons,
    allowBackdropDismiss: options.allowBackdropDismiss,
    modalSize,
    showBackdrop: options.showBackdrop ?? false,
  };
}

/**
 * @preserve
 */
export function getSectionModalClassList(
  options: Required<LFFormModalOptions>,
  buttons: LFFormButton[],
): string[] {
  const base = [
    'fade',
    'lf-modal-dialog-centered',
    'lf-modal-dialog-scrollable',
    'p-5',
  ];
  const { modalSize, showBackdrop } = getModalProperties(options, buttons, true);
  return [
    ...base,
    modalSize,
    'show',
    ...(showBackdrop ? ['lf-modal-backdrop'] : []),
  ];
}

export function generateCustomHtmlModal(
  name: string,
  title: string,
  content: string,
  options: Required<LFFormModalOptions>,
  buttons: LFFormButton[],
): string {
  const { allowBackdropDismiss, useButtons, showBackdrop, modalSize } =
    getModalProperties(options, buttons, false);
  return /*html*/ `
    <div>
      <div class="modal fade show d-block" tabindex="-1" 
      ${allowBackdropDismiss ? dismissAttr(name, 'close') : ''}
      >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable ${modalSize}" ${
      allowBackdropDismiss ? dismissAttr(name, 'block-close') : ''
    }>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close close" data-dismiss="modal" data-bs-dismiss="modal" aria-label="Close"
                ${dismissAttr(name, 'close')}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div class="modal-body">
              ${content}
            </div>
            <div class="modal-footer">
              ${useButtons
                .map(({ key, style, label }) => {
                  return `<button type="button" class="btn btn-${style}"
                            ${dismissAttr(name, key)}
                          >
                            ${label}
                          </button>`;
                })
                .join('')}
            </div>
          </div>
        </div>
      </div>
      <div tabindex="-1" ${
        showBackdrop
          ? 'class="lf-modal-backdrop lf-modal-backdrop-position d-block"'
          : 'd-block'
      } ${allowBackdropDismiss ? dismissAttr(name, 'close') : ''}>
      </div>
    </div>`;
}

/**
 * Returns `null` for `toggleFullScreen` modal type (no section content to set).
 * @preserve
 */
export function generateSectionModalSettings(
  name: string,
  title: string,
  options: Required<LFFormModalOptions>,
  buttons: LFFormButton[],
): { textAbove: string; label: string; textBelow: string } | null {
  const { useButtons, allowBackdropDismiss } =
    getModalProperties(options, buttons, true);

  if (options.modalType === 'toggleFullScreen') {
    return null;
  }

  if (allowBackdropDismiss) {
    console.warn(
      'Section modals do not support backdrop dismiss, setting to false',
    );
  }

  const textAbove = `<button type="button" class="btn-close close" aria-label="Close"
                      ${dismissAttr(name, 'close')}
                    >
                      <span aria-hidden="true">×</span>
                    </button>`;

  if (useButtons.length > 1) {
    console.warn(
      'Section modals only support one button right now, the last button will be used',
    );
  }

  const { key, style, label } = useButtons[useButtons.length - 1];
  const textBelow = `<button type="button" class="btn btn-${style}"
                  ${dismissAttr(name, key)}
                >
                  ${label}
                </button>`;

  return { textAbove, label: title, textBelow };
}
