import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base './' keeps every asset URL relative: the artifact is served under
// /artifact/<id>/version/<git-sha>/ and must resolve its files there.
export default defineConfig({
  base: './',
  plugins: [react()],
})
