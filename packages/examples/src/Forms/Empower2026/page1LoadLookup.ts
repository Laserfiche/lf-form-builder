import {
  findFieldByIdParam,
  generateCSV,
  generateFullFieldHtml,
  makeCSVDownloadButton,
  makeDownloadTriggerButton,
  makeLoadingBar,
  registerFirstTimeLoad,
} from '@lf/lf-form-builder';

// Interface and Type Declarations
// #region Types
interface Emp2026Window extends Window {
  convertTableToCSV: typeof convertTableToCSV;
}
declare const window: Emp2026Window;
// #endregion

// #region Field Configuration
const formFields = {
  // page 1
  lookupRegisterField: { fieldId: 1 }, // field used to register the lookup trigger for the initial data load, can be any field but must be registered in the lookup rule
  exportTableField: { fieldId: 2 }, // parent table field used to add rows for mock data
  exportTableFields: [{ fieldId: 3 }, { fieldId: 4 }], // fields used to generate the CSV, can be any type but must contain the data you want in the CSV
  csvDownloadHtmlField: { fieldId: 6 }, //must be an HTML field to use as a download link
};

const lookupRules = {
  initialDataLoad: 1,
};
// #endregion

// #region Download csv button setup
const convertTableToCSV = async () => {
  const csvString = generateCSV(formFields.exportTableFields);
  await makeCSVDownloadButton(formFields.csvDownloadHtmlField, {
    csvDataUrl: csvString,
    fileName: 'exported-table.csv',
    buttonText: 'Download Table',
    restoreTrigger: { fnName: 'convertTableToCSV', buttonText: 'Prepare Download', disabled: false },
  });
};
window.convertTableToCSV = convertTableToCSV;

const downloadTriggerOptions = {
  fnName: 'convertTableToCSV',
  buttonText: 'Prepare Download',
};

const setDownloadTriggerEnabled = async (enabled: boolean) => {
  await makeDownloadTriggerButton(formFields.csvDownloadHtmlField, {
    ...downloadTriggerOptions,
    disabled: !enabled,
  });
};
// #endregion

// Toggleable mock lookup configuration (moved to top for easy enable/disable)
const mockLookup = {
  enabled: true, // set to false to disable the mock lookup and test with a real lookup rule and data
  delayMs: 4500, // simulate lookup delay in milliseconds
  rows: generateMockRows(120),
};

// Page-level defaults for the loading mask so they're easy to tweak in one place
// Use a transparent inner bar so the outer dimmer controls the visual (and text stays visible)
const defaultLoadingBarOptions = {
  text: '<span style="color:#fff;font-size:1.1rem;font-weight:600;letter-spacing:0.01em;text-shadow:0 1px 2px rgba(0,0,0,0.45);">Loading your form...</span>',
  styles: 'background: transparent; color: white; padding: 1rem; max-width: 540px;',
};

const defaultSubsequentLoadingBarOptions = {
  text: '<span style="color:#fff;font-size:1.1rem;font-weight:600;letter-spacing:0.01em;text-shadow:0 1px 2px rgba(0,0,0,0.45);">Updating form data...</span>',
};

const defaultFullFieldHtmlOptions = {
  // Full-screen dimmer with centered message and backdrop blur
  styles:
    'position: fixed; inset: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.42); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px); display:flex; align-items:center; justify-content:center; color: white; padding: 1rem;',
  id: 'page-loader',
  zIndex: 9999,
};


const DISABLE_PAGE1 = import.meta.env.VITE_DISABLE_PAGE1 === 'true';
console.log('[Empower2026] VITE_DISABLE_PAGE1 raw:', import.meta.env.VITE_DISABLE_PAGE1, 'computed DISABLE_PAGE1:', DISABLE_PAGE1);

export const page1Load = DISABLE_PAGE1
  ? async () => {
      console.log('[Empower2026] page1Load disabled via VITE_DISABLE_PAGE1');
    }
  : async () => {
  // Register the load race between the lookup trigger and the timeout
  const lookupLoadPromise = mockLookup.enabled
    ? runMockLookupLoad()
    : registerFirstTimeLoad({
        // -- `lookupRegisterField` is the field the lookup writes to; we watch its `fieldChange` to
        //    know when lookup data has landed so we can hide the loader.
        lookupRegisterField: formFields.lookupRegisterField,
        
        // -- `lookupRuleId` is the numeric lookup rule id we listen for (onLookupTrigger / onLookupDone)
        //    as part of the race and for optional recurring-mask behavior.
        lookupRuleId: lookupRules.initialDataLoad,   

        // -- `timeout` here is a predicate function (returns boolean). It is polled until true and
        //    acts as a readiness fallback if no lookup triggers; replace with a number for a fixed ms timeout.
        // Step doesn't always exist immediately, so we wait until the step name is not 'Start'
        timeout: () => LFForm?.step?.name !== undefined && LFForm?.step?.name !== 'Start',
        // show the loading mask whenever this lookup runs (not only on first load)
          options: {
            maskOnLookup: true,
            fullFieldHtmlOptions: defaultFullFieldHtmlOptions,
            loadingBarOptions: defaultLoadingBarOptions,
            subsequentLookupLoadingBarOptions: defaultSubsequentLoadingBarOptions,
          },
      });

  // Option 1: Keep download trigger disabled until lookup data is ready.
  await setDownloadTriggerEnabled(false);
  await lookupLoadPromise;
  await setDownloadTriggerEnabled(true);

  // Option 2: Click to download table as soon as lookup is complete
  // await lookupLoadPromise;
  // await makeCSVDownloadButton(formFields.csvDownloadHtmlField, {
  //   disabled: true,
  // });
  // await convertTableToCSV();
};





// #region Demo (mock lookup)
// Demo-only mock lookup block. Kept at bottom so the main page flow is easier to read.

// Demo helper: generate mock rows (moved here so demo code is grouped together)
function generateMockRows(count: number) {
  const rows: { partNumber: string; qty: number }[] = [];
  for (let i = 0; i < count; i++) {
    // deterministic part numbers and qty values for reproducible demos
    const partNumber = `LF-${1001 + i}`;
    const qty = (i % 20) + 1; // cycles 1..20
    rows.push({ partNumber, qty });
  }
  return rows;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const getExportTableFieldId = () => {
  if (typeof formFields.exportTableField.fieldId === 'number') {
    return formFields.exportTableField;
  }
  const firstExportColumn = findFieldByIdParam(formFields.exportTableFields[0])[0];
  const tableId = firstExportColumn?.settings?.tableId;
  if (typeof tableId !== 'number') return undefined;
  return { fieldId: tableId };
};

const getCurrentExportRowCount = () => {
  const [col1] = formFields.exportTableFields;
  const currentValues = LFForm.getFieldValues(col1);
  return Array.isArray(currentValues) ? currentValues.length : 0;
};

const ensureExportTableRows = async (rowCount: number) => {
  const currentRows = getCurrentExportRowCount();
  if (currentRows >= rowCount) return;

  const tableFieldId = getExportTableFieldId();
  const missingRows = rowCount - currentRows;
  if (tableFieldId) {
    await LFForm.addRow(tableFieldId, missingRows);
  }
};

const runMockLookupLoad = async () => {
  const loader = generateFullFieldHtml(
    makeLoadingBar(100, {
      text: '<span style="color:#fff;font-size:1.1rem;font-weight:600;letter-spacing:0.01em;text-shadow:0 1px 2px rgba(0,0,0,0.45);">Loading mock lookup data...</span>',
      styles: 'background: transparent; color: white; padding: 2rem; max-width: 540px;',
    }),
    defaultFullFieldHtmlOptions,
  );
  await LFForm.changeFormSettings({ description: loader });
  await wait(mockLookup.delayMs);

  await ensureExportTableRows(mockLookup.rows.length);
  const [col1, col2] = formFields.exportTableFields;
  for (let i = 0; i < mockLookup.rows.length; i++) {
    const row = mockLookup.rows[i];
    await LFForm.setFieldValues({ ...col1, index: i }, row.partNumber);
    await LFForm.setFieldValues({ ...col2, index: i }, row.qty);
  }
  await LFForm.changeFormSettings({ description: '' });
};

// #endregion