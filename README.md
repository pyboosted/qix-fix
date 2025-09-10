# qix-fix (scaffold)

- Build with Bun, run with Node.js.
- Runtime has zero Bun dependencies; the only runtime dep we plan is `@hyrious/bun.lockb` for parsing `bun.lockb`.

## Layout
- `src/data/threats.ts` — built-in threats DB (TS module).
- `src/data/detectors.ts` — built-in detectors DB (TS module).
- `src/cli.ts` — entrypoint (Node-only guard).

## Build
```sh
bun install  # installs only the bun.lockb parser
bun run build
```

## Run
```sh
# With Node.js
node dist/cli.js --help

# From npm with npx (after publish)
npx qix-fix@latest --help

# From npm with Bun
bunx qix-fix@latest --help
```

## Notes
- You can keep the DBs as TS for maintainability. For external overrides at runtime we’ll support JSON files via CLI flags in implementation.
- Built with Bun, but runtime is fully Node-compatible and also works under Bun.
