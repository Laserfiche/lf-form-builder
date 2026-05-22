import { findFieldByIdParam } from '@/lib/findFieldByLFFormId';
import { LFFormId, TextField } from '@lf/lf-form-types';

const sanitizeForCSV = (value: string) => {
  if (value === null || value === undefined) {
    return '""'; // Represent null/undefined as an empty quoted string
  }
  // Convert to string in case of numbers or other types
  let stringValue = String(value);
  // Escape double quotes by replacing them with two double quotes
  stringValue = stringValue.replace(/"/g, '""');
  // Wrap the entire string in double quotes
  return `"${stringValue}"`;
};

type DownloadTriggerButtonParams = {
  fnName: string;
  buttonText: string;
  disabled: boolean;
};

const makeDownloadTriggerButtonHTML = ({
  fnName,
  buttonText,
  disabled = true,
}: DownloadTriggerButtonParams) => {
  return `<button class="btn btn-secondary text-light" onclick="${fnName}()" ${disabled ? 'disabled' : ''}>${buttonText}</button>`;
};

export const makeDownloadTriggerButton = (
  csvDownloadHtmlField: LFFormId,
  buttonOptions: DownloadTriggerButtonParams,
) => {
  return LFForm.changeFieldSettings(csvDownloadHtmlField, {
    content: makeDownloadTriggerButtonHTML(buttonOptions),
  });
};

type MakeDownloadButtonParams = {
  csvDataUrl?: string;
  fileName?: string;
  buttonText?: string;
  disabled?: boolean;
  // Optional: restore the trigger button after download
  restoreTrigger?: {
    fnName: string;
    buttonText: string;
    disabled?: boolean;
  };
};

const makeDownloadButtonHTML = ({
  csvDataUrl,
  fileName = 'table-data.csv',
  buttonText = 'Download CSV',
  disabled = true,
}: MakeDownloadButtonParams) => {
  const href = csvDataUrl ?? '#';
  return `<a href="${href}" target="_blank" class="btn btn-light" download="${fileName}" ${disabled ? 'disabled' : ''}>${buttonText}</a>`;
};

export const makeCSVDownloadButton = (
  csvDownloadHtmlField: LFFormId,
  buttonOptions: MakeDownloadButtonParams = {},
) => {
  const { restoreTrigger } = buttonOptions;
  if (!restoreTrigger) {
    return LFForm.changeFieldSettings(csvDownloadHtmlField, {
      content: makeDownloadButtonHTML(buttonOptions),
    });
  }

  // Build anchor that restores the trigger button after download click
  const href = buttonOptions.csvDataUrl ?? '#';
  const fileName = buttonOptions.fileName ?? 'table-data.csv';
  const disabled = buttonOptions.disabled ?? false;
  const anchorBase = `class="btn btn-light" target="_blank" download="${fileName}" ${disabled ? 'disabled' : ''}`;
  // produce enabled restore markup (shown only after user clicks download)
  const restoreHtmlEnabled = makeDownloadTriggerButtonHTML({
    fnName: restoreTrigger.fnName,
    buttonText: restoreTrigger.buttonText,
    disabled: false,
  });

  // Store prepared download metadata in a global map and call it via a small onclick.
  // The anchor click performs a native browser download (no sandbox JS-initiated click),
  // then we restore the trigger button.
  const globalWindow = window;
  const downloadState = (globalWindow.__lfCsvDownloadState ??= {});
  if (!globalWindow.__lfAfterCsvDownload) {
    globalWindow.__lfAfterCsvDownload = (key: string) => {
      const state = downloadState[key];
      if (!state) return true;
      LFForm.changeFieldSettings(state.csvDownloadHtmlField, {
        content: state.restoreHtmlEnabled,
      }).catch(() => undefined);
      delete downloadState[key];
      return true;
    };
  }

  const stateKey = `csv_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  downloadState[stateKey] = {
    csvDownloadHtmlField,
    restoreHtmlEnabled,
  };

  const anchor = `<a href="${href}" ${anchorBase} onclick="return window.__lfAfterCsvDownload('${stateKey}')">${buttonOptions.buttonText ?? 'Download CSV'}</a>`;
  return LFForm.changeFieldSettings(csvDownloadHtmlField, { content: anchor });
};

// window function to convert table to base64 string
export const generateCSV = (tableFields: LFFormId[]) => {
  const tableData: string[][] = [];
  // build headers from form field labels
  const csvHeaders = tableFields.map((field) => {
    const fieldSettings = findFieldByIdParam(field)[0]?.settings;
    const label = sanitizeForCSV(fieldSettings?.label ?? '');
    return label;
  });
  const csvData = [];
  // gather all field values
  for (const columnFieldId of tableFields) {
    tableData.push(LFForm.getFieldValues<TextField[]>(columnFieldId));
  }
  if (tableData.length === 0) return;

  // convert field values to csv rows
  csvData.push(csvHeaders.join(','));
  for (let i = 0; i < tableData[0].length; i++) {
    // TODO: convert non string values to strings (i.e., checkbox/radio)
    const row = tableData.map((c) => sanitizeForCSV(c[i]));
    csvData.push(row.join(','));
  }

  // convert csv to base64 string
  const csv = csvData.join('\n');
  const b64 = btoa(csv);
  const dataUrl = `data:text/csv;base64,${b64}`;
  // create download link
  return dataUrl;
};
