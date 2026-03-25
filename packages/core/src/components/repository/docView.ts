import {
  DefaultRepositoryAPIOptions,
  resolveEntryIdField,
} from '@lib/api/repositoryApiHelpers';
import { IframeOptions, IframeView } from './iframe';

/**
 * DocViewOptions is the options object that is passed to the DocView constructor.
 * @param customHtmlField - The LFFormField or LFFormId of the Custom HTML field that will be used to render the DocView iframe.
 * @param hostname - The hostname of the Laserfiche repository. Defaults to 'app.laserfiche.com'.
 * @param iframeMode - The mode of the iframe. Can be 'embed' or 'mobile'.
 * @param onload - A callback function that is called when the DocView iframe is loaded.
 */
export type DocViewOptions = Required<
  Omit<
    DefaultRepositoryAPIOptions<
      IframeOptions & {
        iframeMode?: 'embed' | 'mobile';
        repoType?: 'docView' | 'browse';
      }
    >,
    'apiClient'
  >
>;
export class DocView extends IframeView {
  /**
   * The DocView class constructs an object that is used to render a DocView iframe in a Custom HTML field.
   * You must call the render method to render the DocView iframe.
   * @param docViewOptions - The options object that is passed to the DocView constructor.
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
  constructor(private docViewOptions: DocViewOptions) {
    super(docViewOptions.options);
  }

  render() {
    const { entryIdField, repositoryId, options } = this.docViewOptions;

    const entryId = resolveEntryIdField(entryIdField);
    if (!entryId) throw new Error('Entry ID is required');
    if (!repositoryId) throw new Error('Repository ID is required');
    const docViewUrlParameters = options.iframeMode
      ? `mode=${options.iframeMode}`
      : '';
    const aspxType = options.repoType === 'browse' ? 'Browse' : 'DocView';
    const urlPart = this.handleUrlPart(options.repoType, docViewUrlParameters, entryId);
    const frameUrl = `${
      options.hostname ? `https://${options.hostname}` : ''
      }/laserfiche/${aspxType}.aspx?repo=${repositoryId}${urlPart}`;
    console.log(frameUrl)
    return super.render(frameUrl);
  };
  private handleUrlPart = (repoType: DocViewOptions['options']['repoType'], docViewUrlParameters: string, entryId: number) => {
    if (repoType === 'browse') {
      return `#?id=${entryId}&${docViewUrlParameters}`;
    } else {
      return `&id=${entryId}#?${docViewUrlParameters}`;
    }  
  }
}
