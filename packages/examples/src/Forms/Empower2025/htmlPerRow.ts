import { LFFormButtonStyle, LFFormModal, LFFormModalSize, throttle } from '@lfz/lf-form-builder';
import { LFFormId, NumberField, TextField } from '@lfz/lf-form-types';
import { FormFieldsType } from '.';

interface CustomWindow extends Window {
  LFC: {
    openModalRow?: (index: number) => void;
  };
}
declare const window: CustomWindow;

window.LFC = window.LFC ?? {}

export const registerHtmlPerRow = (formFields: FormFieldsType) => {
  const productModal = new LFFormModal(
    formFields.productModal,
    'product-modal',
    {
      size: LFFormModalSize.sm,
    },
  );
  window.LFC.openModalRow = async (index: number) => {
    const markup = ({
      name,
      brand,
      currency,
    }: {
      name: string;
      brand: string;
      currency: number;
    }) => {
      return `<div class="table-row">
          <div class="table-cell">${name}</div>
          <div class="table-cell">${brand}</div>
          <div class="table-cell">${currency}</div>
        </div>`;
    };

    const productName = LFForm.getFieldValues<TextField>({
      fieldId: formFields.productName.fieldId,
      index,
    });
    const productBrand = LFForm.getFieldValues<TextField>({
      fieldId: formFields.productBrand.fieldId,
      index,
    });
    const productCurrency = LFForm.getFieldValues<NumberField>({
      fieldId: formFields.productCurrency.fieldId,
      index,
    });

    productModal.setDetails({
      title: productName,
      content: markup({
        name: productName,
        brand: productBrand,
        currency: productCurrency,
      }),
      buttons: [
        {
          key: 'ok',
          label: 'Ok',
          style: LFFormButtonStyle.primary,
        },
      ],
    });
    await productModal.show();
  };

  const handleTableHtmlChange = async (fieldList: LFFormId[]) => {
    const modalOpenList: { fields: LFFormId[]; markup: string[] } = {
      fields: [],
      markup: [],
    };

    for (const field of fieldList) {
      const index = field.index!;

      modalOpenList.fields.push({
        fieldId: formFields.openModalHtml.fieldId,
        index,
      });
      modalOpenList.markup.push(
        `<button onclick="LFC.openModalRow(${index})" class="btn btn-link">Open Product</button>`,
      );
    }
    await LFForm.setFieldValues(modalOpenList.fields, modalOpenList.markup);
  };

  const handleFieldChange: Parameters<typeof LFForm.onFieldChange>[0] = async (
    ev,
  ) => {
    await handleTableHtmlChange(ev.options);
    LFForm.unsubscribe('fieldChange', { handlerName: 'handleTableHtmlChange' });
  };

  // This will be called to create the table row html markup and register modals on load
  LFForm.onFieldChange(
    throttle(handleFieldChange),
    { ...formFields.productName, handlerName: 'handleTableHtmlChange' },
  );
  // This will recreate the row html markup and modals on blur of the field
  // Throttle is not needed here as these are user made changes
  LFForm.onFieldBlur(
    async (ev) => {
      await handleTableHtmlChange(ev.options);
    },
    { ...formFields.productName, handlerName: 'handleTableHtmlChange' },
  );
};
