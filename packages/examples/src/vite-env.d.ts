// Vite typing option: enables strict checking of env keys on import.meta.env.
interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

// Declare the specific environment variables this package expects.
// Access them in code via import.meta.env.VITE_...
interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_STRIPE_FRAME_ORIGIN?: string;
  readonly VITE_STRIPE_FRAME_URL?: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_TRANSLATION_ENDPOINT?: string;
  readonly VITE_DISABLE_PAGE1?: string;
  readonly VITE_DISABLE_PAGE2?: string;
  readonly VITE_DISABLE_PAGE3?: string;
}

// TypeScript declaration merging augments the global ImportMeta interface
// so import.meta.env is strongly typed as ImportMetaEnv in this package.
interface ImportMeta {
  readonly env: ImportMetaEnv
}