# qix-fix

Supply-chain scanner for detecting and mitigating package threats in Node.js projects. Scans lockfiles, code, and system package caches for known compromised packages and malicious code patterns.

## Features

- **Lockfile Analysis**: Scans `package-lock.json`, `yarn.lock`, `bun.lock`, and `bun.lockb` for known compromised packages
- **Code Detection**: Uses ripgrep-powered pattern matching to find malicious code in your project and dependencies  
- **System Cache Scanning**: Analyzes npm, yarn, and bun cache directories for threats
- **Auto-Pinning**: Automatically applies package overrides to pin safe versions
- **Threat Database**: Built-in database of known compromised packages with version ranges
- **Malware Detectors**: Pattern-based detection of crypto-draining malware and other threats

## Installation

```sh
# Install globally
npm install -g qix-fix

# Or run directly
npx qix-fix@latest --help
bunx qix-fix@latest --help
```

## Usage

### Scan Lockfiles
```sh
qix-fix lock                    # Scan lockfiles for known threats
qix-fix lock --update          # Auto-apply pins to package.json
qix-fix lock --chains 3        # Show dependency chains to threats
```

### Scan Code
```sh
qix-fix scan                    # Scan project code for malicious patterns
qix-fix scan --text            # Use simple text output
qix-fix scan --id detector-id  # Filter to specific detectors
qix-fix scan dist build        # Scan additional directories
```

### Scan System Caches
```sh
qix-fix sys                     # Scan npm/yarn/bun caches
qix-fix sys --text            # Use simple text output
```

## Built-in Threat Database

The tool includes detection for:
- **Recent supply-chain attacks** (Sept 2025): chalk, debug, ansi-styles, supports-color, etc.
- **DuckDB compromise** (Jan 2025): Crypto-draining malware in duckdb packages
- **Malware patterns**: ETH address hardcoding, transaction interception, Solana key manipulation

## Development

```sh
bun install                     # Install dependencies
bun run build                   # Build for Node.js
bun run dev                     # Watch mode
bun test                        # Run tests
bun run typecheck              # Type checking
```

Built with Bun, runs on Node.js ≥18. Zero runtime Bun dependencies.
