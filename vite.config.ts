// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Pins the build to Nitro's Node preset for Render (a plain Node web service).
  // Ignored inside the Lovable sandbox, which always forces cloudflare-module regardless
  // of this option — see @lovable.dev/vite-tanstack-config's nitro option docs.
  nitro: {
    preset: "render_com",
  },
  plugins: [
    VitePWA({
      // manifest.webmanifest and all icons already live in public/ and are linked by hand
      // in src/routes/__root.tsx — don't let the plugin generate or inject its own.
      manifest: false,
      injectManifest: false,
      injectRegister: false,
      // TanStack Start has no index.html for the plugin to transform; registration is
      // done manually via the `virtual:pwa-register` module (see src/lib/pwa.tsx).
      strategies: "generateSW",
      registerType: "autoUpdate",
      // The nitro/render_com preset writes the client-served output to .output/public,
      // not Vite's generic top-level build.outDir ("dist") that the plugin defaults to —
      // point it there explicitly or it globs an empty directory and fails the build.
      outDir: ".output/public",
      workbox: {
        globDirectory: ".output/public",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
        cleanupOutdatedCaches: true,
        // The plugin defaults this to "index.html", assuming a static SPA shell to serve
        // offline navigations from. This app is fully SSR — there is no such file — so an
        // unset default would register a NavigationRoute pointing at a precache entry that
        // never exists, breaking offline navigation instead of degrading gracefully.
        navigateFallback: null,
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
});
