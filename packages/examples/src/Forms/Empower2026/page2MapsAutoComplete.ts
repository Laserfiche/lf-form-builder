import { AddressFieldValue, LFFormId } from '@lfz/lf-form-types';
import {
  initAddressValidation,
  initGoogleMapsAutocomplete,
  LFFormModal,
  type VerdictDecision,
  type VerdictInfo,
} from '@lfz/lf-form-builder';

export type GoogleMaps = {
  addressSearch: LFFormId;
  addressPopulate: LFFormId;
  addressConfirmationModal: LFFormId;
};

// Page-local formFields for page2 (exported so the page index can pass them)
export const page2FormFields = {
  addressSearch: { fieldId: 10, componentType: 'SingleLine' } as const,
  addressPopulate: { fieldId:11 } as const,
  addressConfirmationModal: { fieldId: 18 } as const,
} as const;

const formatAddressAsString = (address: AddressFieldValue) =>
  `${address.address1}${address.address2 ? ` ${address.address2}` : ''}, ${address.city}, ${address.province} ${address.zipcode}, ${address.country ?? ''}`;

const normalizeAddress = (address: AddressFieldValue): AddressFieldValue => ({
  address1: address.address1.trim().toLowerCase(),
  address2: address.address2.trim().toLowerCase(),
  city: address.city.trim().toLowerCase(),
  province: address.province.trim().toLowerCase(),
  zipcode: address.zipcode.trim().toLowerCase(),
  country: (address.country ?? '').trim().toLowerCase(),
});

const addressesMatch = (a: AddressFieldValue, b: AddressFieldValue | null) => {
  if (!b) return false;
  const left = normalizeAddress(a);
  const right = normalizeAddress(b);
  return (
    left.address1 === right.address1 &&
    left.address2 === right.address2 &&
    left.city === right.city &&
    left.province === right.province &&
    left.zipcode === right.zipcode &&
    left.country === right.country
  );
};

const handleValidationVerdict = async (
  confirmationModal: LFFormModal,
  info: VerdictInfo,
): Promise<VerdictDecision> => {
  if (info.corrected === null || !info.hasAddressChanges || addressesMatch(info.original, info.corrected)) {
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

const DISABLE_PAGE2 = import.meta.env.VITE_DISABLE_PAGE2 === 'true';

export const page2Load = DISABLE_PAGE2
  ? async (_opts?: { formFields?: GoogleMaps; apiKey?: string }) => {
      console.log('[Empower2026] page2Load disabled via VITE_DISABLE_PAGE2');
    }
  : async ({
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
        // Search while typing (without requiring blur/click-away)
        searchWhileTyping: true, // enable search while typing to allow for more dynamic suggestions
        searchWhileTypingPollMs: 150,
        minChars: 10, // require more characters to trigger autocomplete to reduce unnecessary API calls
        debounceMs: 250, // add debounce to further reduce API calls while typing
      });

      const confirmationModal = new LFFormModal(formFields.addressConfirmationModal);
      confirmationModal.setDetails({
        title: 'Confirm Address',
      });
      void confirmationModal.hide();

      await initAddressValidation({
        apiKey,
        addressField: formFields.addressPopulate,
        onVerdict: (info: VerdictInfo) => handleValidationVerdict(confirmationModal, info),
      });
    };

