import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA, type VitePWAOptions } from "vite-plugin-pwa";
import tsConfigPaths from "vite-tsconfig-paths";

const { version: appVersion } = JSON.parse(
  readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"),
) as { version: string };

export default defineConfig(async ({ command, mode }) => {
  // `vite build --mode development` (our `build:dev` script): force a dev-flavored
  // React runtime (extra warnings, unminified names) inside an otherwise production build.
  const isDevBuild = command === "build" && mode === "development";

  return {
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    ...(isDevBuild
      ? {
          environments: {
            client: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
          },
          esbuild: { keepNames: true },
        }
      : {}),
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      ignoreOutdatedRequests: true,
    },
    server: {
      host: "::",
      port: 8080,
      // Windows/editor saves can split a single write into several fs events;
      // debounce so HMR doesn't reload on a half-written file.
      watch: { awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 100 } },
    },
    plugins: [
      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        importProtection: {
          behavior: "error",
          client: { files: ["**/server/**"], specifiers: ["server-only"] },
        },
        // Route TanStack Start's server entry through src/server.ts (our SSR error wrapper).
        server: { entry: "server" },
      }),
      // Pins the production build to Nitro's Node preset for Render (a plain Node web service).
      ...(command === "build"
        ? [(await import("nitro/vite")).nitro({ preset: "render_com" })]
        : []),
      viteReact(),
      VitePWA({
        // manifest.webmanifest and all icons already live in public/ and are linked by hand
        // in src/routes/__root.tsx — don't let the plugin generate or inject its own.
        manifest: false,
        // The plugin's own .d.ts declares this as `Partial<CustomInjectManifestOptions>`, missing
        // the `| false` that `manifest`/`injectRegister` above have — even though the runtime
        // happily treats a falsy value as "use defaults" (see vite-plugin-pwa's
        // `options.injectManifest || {}`). Cast through `unknown` to work around that upstream gap.
        injectManifest: false as unknown as VitePWAOptions["injectManifest"],
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
  };
});
