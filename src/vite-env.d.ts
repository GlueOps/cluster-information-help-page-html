/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CAPTAIN_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
