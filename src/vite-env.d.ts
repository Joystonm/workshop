/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MINIMAX_API_KEY?: string
  readonly VITE_MINIMAX_API_URL?: string
  readonly VITE_FIRECRAWL_API_KEY?: string
  readonly VITE_FIRECRAWL_API_URL?: string
  readonly VITE_AGENTMAIL_API_KEY?: string
  readonly VITE_AGENTMAIL_INBOX_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
