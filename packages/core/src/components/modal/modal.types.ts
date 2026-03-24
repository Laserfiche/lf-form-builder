export interface ModalWindow extends Window {
  dismissModal: (name: string, button: string) => void;
}

export const LFFormButtonStyle = {
  default: 'default',
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'info',
  light: 'light',
  dark: 'dark',
} as const;

export type LFFormButtonStyleEnum =
  (typeof LFFormButtonStyle)[keyof typeof LFFormButtonStyle];

export type LFFormButton = {
  label: string;
  key: 'close' | 'ok' | string;
  style: LFFormButtonStyleEnum;
  onClick?: () => void;
};

export const LFFormModalSize = {
  sm: 'sm',
  default: 'default',
  lg: 'lg',
  xl: 'xl',
  full: 'full',
} as const;

export type LFFormModalSizeEnum =
  (typeof LFFormModalSize)[keyof typeof LFFormModalSize];

export const LFFormModalTypes = {
  default: 'default',
  toggleFullScreen: 'toggleFullScreen',
} as const;

export type LFFormModalTypesEnum =
  (typeof LFFormModalTypes)[keyof typeof LFFormModalTypes];

export type LFFormModalOptions = {
  size?: LFFormModalSizeEnum;
  modalType?: LFFormModalTypesEnum;
  autoHideOnClose?: boolean;
  showBackdrop?: boolean;
  allowBackdropDismiss?: boolean;
};

export type LFFormModalDetails = {
  title?: string;
  content?: string;
  buttons?: LFFormButton[];
};
