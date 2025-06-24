interface ImportMetaEnv {
  VITE_API_BASE_URL: string;
  // add other env vars here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}