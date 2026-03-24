import { AddressFieldValue, LFFormId } from '@lfz/lf-form-types';
import { initGoogleMapsAutocomplete } from '../GoogleMaps/autocomplete';
import {
  initAddressValidation,
  VerdictDecision,
  VerdictInfo,
} from '../GoogleMaps/addressValidation';
import { LFFormModal } from '@lfz/lf-form-builder';

export type GoogleMaps = {
  addressSearch: LFFormId;
  addressPopulate: LFFormId;
  addressConfirmationModal: LFFormId;
};

const formatAddressAsString = (address: AddressFieldValue) =>
  `${address.address1}${address.address2 ? ` ${address.address2}` : ''}, ${address.city}, ${address.province} ${address.zipcode}, ${address.country ?? ''}`;

const handleValidationVerdict = async (
  confirmationModal: LFFormModal,
  info: VerdictInfo,
): Promise<VerdictDecision> => {
  if (info.isConfirmed || info.corrected === null) {
    return 'accept';
  }
  const { resolve, promise } = Promise.withResolvers<boolean>();
  confirmationModal.setDetails({
    content: /*html*/ `<div>
        <p>Please confirm your address:</p>
        <p><strong>Original Address:</strong></p>
        <p>${formatAddressAsString(info.original)}</p>
        <p><strong>Corrected Address:</strong></p>
        <p>${formatAddressAsString(info.corrected)}</p>
      </div>`,
    buttons: [
      {
        key: 'ok',
        style: 'primary',
        label: 'OK',
        onClick: () => resolve(true),
      },
      {
        key: 'cancel',
        style: 'secondary',
        label: 'Cancel',
        onClick: () => {
          resolve(false);
        },
      },
    ],
  });
  await confirmationModal.show();
  const confirmed = await promise;

  return confirmed ? 'accept' : 'skip';
};

export const page2Load = async ({
  formFields,
  apiKey,
}: {
  formFields: GoogleMaps;
  apiKey: string;
}) => {
  // page 2 - Maps Auto-Complete
  await initGoogleMapsAutocomplete({
    apiKey,
    searchField: formFields.addressSearch,
    addressField: formFields.addressPopulate,
  });

  const confirmationModal = new LFFormModal(
    formFields.addressConfirmationModal,
  );
  confirmationModal.setDetails({
    title: 'Confirm Address',
  });
  void confirmationModal.hide();

  await initAddressValidation({
    apiKey,
    addressField: formFields.addressPopulate,
    onVerdict: (info) => handleValidationVerdict(confirmationModal, info),
  });
};
