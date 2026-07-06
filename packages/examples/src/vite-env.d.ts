/// <reference types="vite/client" />

// Vite typing option: enables strict checking of env keys on import.meta.env.
interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

// Declare the specific environment variables this package expects.
// Access them in code via import.meta.env.VITE_...
interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_BRAINTREE_TOKENIZATION_KEY?: string;
  readonly VITE_STRIPE_FRAME_ORIGIN?: string;
  readonly VITE_STRIPE_FRAME_URL?: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_TRANSLATION_ENDPOINT?: string;
  readonly VITE_DISABLE_PAGE1?: string;
  readonly VITE_DISABLE_PAGE2?: string;
  readonly VITE_DISABLE_PAGE3?: string;
  readonly VITE_DISABLE_PAGE4?: string;
  readonly VITE_DISABLE_PAGE5?: string;
  readonly VITE_AUTHORIZENET_API_LOGIN_ID?: string;
  readonly VITE_AUTHORIZENET_CLIENT_KEY?: string;
}

// TypeScript declaration merging augments the global ImportMeta interface
// so import.meta.env is strongly typed as ImportMetaEnv in this package.
interface ImportMeta {
  readonly env: ImportMetaEnv
}