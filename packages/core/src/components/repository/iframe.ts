import { findFieldByIdParam } from '@lib/findFieldByLFFormId';
import { LFFormField, LFFormId } from '@lf/lf-form-types';

/**
 * DocViewWindow is a global interface that is used to communicate with the DocView iframe.
 * Extend this interface to add new methods that can be called in conjunction with the DocView iframe.
 */
export interface IframeWindow extends Window {
  onIframeLoad: (fieldId: number) => void;
}
declare const window: IframeWindow;

export type IframeOptions = {
  id?: string;
  key?: string;
  customHtmlField?: LFFormField | LFFormId;
  hostname?: string;
  iframeStyles?: string;
  onload?: () => void;
};
export class IframeView {
  private static handlerCache: Record<string, Array<() => void>> = {};
  private htmlField?: LFFormField;

  public key?: string;
  /**
   * The DocView class constructs an object that is used to render a DocView iframe in a Custom HTML field.
   * You must call the render method to render the DocView iframe.
   * @param iframeOptions - The options object that is passed to the DocView constructor.
   * @preserve docs
   * @example
   * ```javascript
   * const docView = new DocView({
   *   entryIdField: { variableName: 'Entry_ID' },
   *   repositoryId: 'r-123456',
   *   options: {
   *     customHtmlField: { fieldId: 27 },
   *     hostname: 'app.laserfiche.com',
   *     iframeMode: 'embed',
   *     onload: () => console.log('loaded'),
   *   }
   * });
   * await docView.render();
   */
  constructor(private iframeOptions: IframeOptions) {
    this.key = iframeOptions.key;
    if (this.iframeOptions.customHtmlField) {
      this.htmlField = findFieldByIdParam(
        this.iframeOptions.customHtmlField,
      )[0];
      IframeView.handlerCache[this.htmlField.fieldId] =
        IframeView.handlerCache[this.htmlField.fieldId] ?? [];
      if (iframeOptions.onload) {
        IframeView.handlerCache[this.htmlField.fieldId].push(
          iframeOptions.onload ?? (() => {}),
        );
      }
      if (!window.onIframeLoad) {
        window.onIframeLoad = (fieldId) => {
          if (IframeView.handlerCache[fieldId]) {
            IframeView.handlerCache[fieldId].forEach((fn) => fn());
          }
        };
      }
    }
  }
  /**
   * The render method is used to render the DocView iframe in the Custom HTML field.
   * @returns {Promise<void>}
   * @preserve docs
   */
  async render(frameUrl: string): Promise<void> {
    const customHtmlField = this.iframeOptions.customHtmlField;
    if (customHtmlField === undefined)
      throw new Error(
        'Custom HTML Field was undefined. You may have wanted to use the generateHTML method',
      );
    const htmlField = findFieldByIdParam(customHtmlField)[0];
    if (!htmlField || htmlField.componentType !== 'CustomHTML')
      throw new Error('No valid Custom HTML field found');

    await LFForm.changeFieldSettings(htmlField, {
      content: this.generateHTML(
        frameUrl,
        `window.onIframeLoad('${htmlField.fieldId}')`,
      ),
    });
  }
  generateHTML(frameUrl: string, onloadString?: string) {
    const options = this.iframeOptions;
    const styleString = options.iframeStyles ? options.iframeStyles : '';
    return `<iframe
      ${options.id ? `id="${options.id}"` : ''}
      src="${frameUrl}"
      width="100%"
      height="100%"
      ${onloadString ? `onload="${onloadString}"` : ''}
      style="border: none;${styleString}">
    </iframe>`;
  }

  changeOptions(options: Partial<IframeOptions>) {
    this.iframeOptions = {
      ...this.iframeOptions,
      ...options,
    };
  }

  async destroy() {
    const options = this.iframeOptions;
    if (options.customHtmlField) {
      const htmlField = findFieldByIdParam(options.customHtmlField)[0];
      await LFForm.changeFieldSettings(htmlField, {
        content: '',
      });
      delete IframeView.handlerCache[htmlField.fieldId];
    }
  }
}
