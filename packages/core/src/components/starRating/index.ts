import { LFFormId } from '@lfz/lf-form-types';
import { findField } from '../../lib/findFieldByLFFormId';
import './starRating.lfless';

export interface StarRatingWindow extends Window {
  handleVoteChange: (event: OnClickEvent) => void;
}
declare const window: StarRatingWindow;

type StarFieldFor = `field-for-${number}-${number | undefined}`;
const makeStarHtml = (
  count: number,
  fieldFor: StarFieldFor,
  maxStarCount?: number
): string => /* html */`
<div class="flex star-container">
  ${Array.from(Array(maxStarCount ?? 5).keys())
    .map((i) => {
      const starNum = i + 1;
      const selectedClass = count >= starNum ? 'selected' : '';
      return /* html */`<span onclick="window.handleVoteChange(event, ${starNum})" class="star ${selectedClass} ${fieldFor}-${starNum}">★</span>`;
    })
    .join('')}
</div>`;

/** @description [rowFieldId]: starFieldId */
const rowToStarMap: Record<
  StarFieldFor,
  { count: number; maxStarCount: number }
> = {};
export type OnClickEvent = {
  currentTarget: {
    classList: string[];
  };
};
const parseIntOrDefault = <T>(str: string, def: T) => {
  const parsed = parseInt(str);
  return isNaN(parsed) ? def : parsed;
};
export const onVoteChange = async (
  starFiedFor: StarFieldFor,
  initOptions?: { count?: number; maxStarCount?: number }
) => {
  const splitClass = starFiedFor.split('-');
  const fieldId = parseInt(splitClass[2]);
  const index = parseIntOrDefault(splitClass[3], undefined);
  const clickedRating = parseIntOrDefault(splitClass[4], 0);
  const starKey = `field-for-${fieldId}-${index}` satisfies StarFieldFor;
  const { count, maxStarCount } = rowToStarMap[starKey] ?? initOptions ?? {};
  const trueMaxStarCount = maxStarCount ?? 5;
  const currentStarCount = count || 0;
  const newRating = currentStarCount === clickedRating ? 0 : clickedRating;
  rowToStarMap[starKey] = { count: newRating, maxStarCount: trueMaxStarCount };
  await LFForm.setFieldValues({ fieldId, index }, newRating ?? 0);
  const description = makeStarHtml(newRating, starKey, trueMaxStarCount);
  await LFForm.changeFieldSettings({ fieldId, index }, { description });
};
export const handleVoteChange = async (event: OnClickEvent) => {
  const className = event.currentTarget.classList.find((c) =>
    c.startsWith('field-for')
  );
  if (!className) {
    console.warn('Star component not initialized properly');
    return;
  }
  return onVoteChange(className as StarFieldFor);
};
export type StarHandlerOptions = {
  starColor?: string;
  maxStars?: number;
  rowNumberFieldId?: number;
};
export const registerStarHandler = async (
  starField: LFFormId,
  voteOptions?: StarHandlerOptions
) => {
  const foundStarField = findField(starField)[0];
  if (
    foundStarField.settings.isInCollection ||
    (foundStarField.settings.isInTable &&
      voteOptions?.rowNumberFieldId === undefined)
  ) {
    throw new Error('rowNumberFieldId is required for table fields');
  }
  const starFieldId = foundStarField.fieldId;
  await LFForm.addCSSClasses(starField, 'star-component');
  window.handleVoteChange = handleVoteChange;
  if (voteOptions?.rowNumberFieldId) {
    LFForm.onFieldChange(
      async (event) => {
        // update star html in matching row with new class
        const matchingStars = LFForm.findFieldsByFieldId(starFieldId);
        for (let i = 0; i < event.options.length; i++) {
          const rowNum = event.options[i].index;
          if (rowNum === undefined) return console.error('rowNum is undefined');
          const matchingStar = matchingStars[rowNum];

          const html = matchingStar.settings.description;
          const dummyDom = document.createElement('div');
          dummyDom.innerHTML = html;
          const stars = dummyDom.querySelectorAll('span');
          for (let i = 0; i < stars.length; i++) {
            const star = stars[i];
            const classes = star.classList;
            for (const c of classes) {
              if (c.startsWith('field-for')) {
                star.classList.remove(c);
                star.classList.add(
                  `field-for-${starFieldId}-${rowNum}-${i + 1}`
                );
              }
            }
          }
          const description = dummyDom.innerHTML;
          await LFForm.changeFieldSettings(
            { fieldId: matchingStar.fieldId, index: rowNum },
            { description }
          );
        }
      },
      { fieldId: voteOptions.rowNumberFieldId }
    );
    return;
  } else {
    const fieldFor =
      `field-for-${starFieldId}-undefined` satisfies StarFieldFor;
    await onVoteChange(fieldFor, {
      count: 0,
      maxStarCount: voteOptions?.maxStars,
    }).catch(console.error);
  }
};

export const registerAllStarComponents = async (
  voteOptions: StarHandlerOptions
) => {
  const foundStarFields = LFForm.findFieldsByClassName('star-component');
  const starFields = Array.isArray(foundStarFields) ? foundStarFields : [];
  await Promise.all(starFields.map((f) => registerStarHandler(f, voteOptions)));
  return starFields;
};