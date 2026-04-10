import { registerFirstTimeLoad } from './firstTimeLoad';
import { generateCSV, makeCSVDownloadButton, makeDownloadTriggerButton } from '@lfz/lf-form-builder';

// Interface and Type Declarations
interface Emp2026Window extends Window {
  convertTableToCSV: typeof convertTableToCSV;
}
declare const window: Emp2026Window;

const formFields = {
  // page 1
  lookupRegisterField: { fieldId: 3 },
  exportTableFields: [{ fieldId: 2 }, { fieldId: 3 }],
  csvDownloadHtmlField: { fieldId: 4 },
};

const lookupRules = {
  initialDataLoad: 1,
};


const convertTableToCSV = async () => {
  const csvString = generateCSV(formFields.exportTableFields);
  await makeCSVDownloadButton(formFields.csvDownloadHtmlField, {
    csvDataUrl: csvString,
    fileName: 'exported-table.csv',
    buttonText: 'Download Table',
  });
};
window.convertTableToCSV = convertTableToCSV;

export const page1Load = async () => {
  // Register the load race between the lookup trigger and the timeout
  const lookupLoadPromise = registerFirstTimeLoad({
    lookupRegisterField: formFields.lookupRegisterField,
    lookupRuleId: lookupRules.initialDataLoad,
    // Step doesn't always exist immediately, so we wait until the step name is not 'Start'
    timeout: () => LFForm?.step?.name !== undefined && LFForm?.step?.name !== 'Start',
  });

  // Option 1: Click to prepare table, then another click to download
  // i.e., If the table is modifiable after lookup
  const downloadOptions = {
    fnName: 'convertTableToCSV',
    buttonText: 'Prepare Download',
  };
  await makeDownloadTriggerButton(formFields.csvDownloadHtmlField, {
    disabled: true,
    ...downloadOptions,
  });
  await lookupLoadPromise;
  await makeDownloadTriggerButton(formFields.csvDownloadHtmlField, {
    disabled: false,
    ...downloadOptions,
  });

  // Option 2: Click to download table as soon as lookup is complete
  // await lookupLoadPromise;
  // await makeCSVDownloadButton(formFields.csvDownloadHtmlField, {
  //   disabled: true,
  // });
  // await convertTableToCSV();
};