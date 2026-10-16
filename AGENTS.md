# Agent instructions

## Local development

Run commands from the repository root. Use Node.js `24.19.x` as pinned in `.nvmrc` and pnpm `12.14.0` as declared in `package.json`. Run pnpm through Corepack so the repository's version is selected.

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm dev
```

Open the local URL printed by Vite in the terminal. The app needs a development server; opening `index.html` directly with `file://` will not work.

## Build and validation

```sh
corepack pnpm typecheck
corepack pnpm build
corepack pnpm preview
```

`build` checks TypeScript and writes the production site to `dist/`. `preview` serves that build; its published base path is `/selector-filamentos/`.

Additional repository checks are available through these scripts:

```sh
corepack pnpm run verify:wizard
corepack pnpm run verify:domain
corepack pnpm run verify:persistence
corepack pnpm run verify:pages-build
corepack pnpm run verify:pages-workflow
```

Run `verify:pages-build` after `build`.
