/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_SITE_KEY: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  // Add other VITE_ env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
