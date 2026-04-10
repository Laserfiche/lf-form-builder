export type LoadingBarOptions = {
  height?: number;
  type?: 'warning' | 'info' | 'danger';
  text?: string;
  styles?: string;
  containerClass?: string;
};

/**
 *
 * @param {number} curPrecent
 * @param {LoadingBarOptions} loadingBarOptions
 * @returns {string}
 * @example
 *
 * ```js
 * const customHtmlFieldId = { fieldId: 10 };
 * await LFForm.changeFieldSettings(customHtmlFieldId, {
 *     content: makeLoadingBar(50, { height: 200 })
 * });
 * ```
 */
export function makeLoadingBar(
  curPrecent: number,
  loadingBarOptions?: LoadingBarOptions,
) {
  const { height, type, text, styles='', containerClass='' } = loadingBarOptions || {};
  return `
<div class="${containerClass}" style="display: flex;${height ? `height: ${height};` : 'flex: 1;'}flex-direction: column;justify-content: center; width:100%;${styles}">
  ${text ? `<h6 style="text-align: center;">${text}</h6>` : ''}
  <div class="progress">
    <div class="progress-bar progress-bar-striped progress-bar-animated ${type ? `bg-${type}` : ''}" role="progressbar" aria-valuenow="${curPrecent}" aria-valuemin="0" aria-valuemax="100" style="width: ${curPrecent}%"></div>
  </div>
</div>`;
}
