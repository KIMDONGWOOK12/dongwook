# Chrome DevTools MCP Extension

VSCode extension that runs the Chrome DevTools MCP server in the Extension Host process.

## Architecture

This extension uses [chrome-devtools-mcp](https://github.com/AntPb/chrome-devtools-mcp) and runs it directly in the Extension Host, providing:

- **MCP Server** - Runs with HTTP/SSE transport on a dynamic port
- **CDP Port Management** - Automatically fetches and updates CDP port from Unified State Sync
- **Retry Logic** - Exponential backoff for automatic recovery

## Structure

```
chrome-devtools-mcp/
├── src/
│   ├── extension.ts    # Main extension logic
│   ├── logger.ts       # Output channel logger
│   └── types.d.ts      # Type declarations for cdt_mcp module
├── cdt_mcp/            # Copied from node_modules during prepare (gitignored)
├── patches/
│   └── chrome-devtools-mcp+0.12.1.patch  # Patch to export createServer function
├── out/                # Compiled JavaScript (auto-generated)
├── .gitignore          # Ignores cdt_mcp/ and cloned repos
├── package.json        # Extension manifest
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## How chrome-devtools-mcp is Integrated

The `chrome-devtools-mcp` package is installed from npm and patched using `patch-package`. During `npm install`, the `prepare` script:

1. Applies the patch (exports `createServer` and `args`)
2. Copies `node_modules/chrome-devtools-mcp/build/src` to `cdt_mcp/`
3. Removes `cdt_mcp/third_party/issue-descriptions/` to keep paths short for Windows

### Why This Approach?

1. **Windows path limits** - The 260 character path limit on Windows prevents copying deep `node_modules` paths
2. **ESM with Top-Level Await** - The package uses ESM with top-level await (TLA), which can't be `require()`d
3. **Webpack compatibility** - We use `/* webpackIgnore: true */` in the dynamic import to prevent webpack from transforming it, allowing Node.js to handle the ESM import at runtime

### Key Technical Details

The `chrome-devtools-mcp` package uses ESM with top-level await. This creates challenges:

1. **Can't use static imports** - Webpack would convert them to `require()`, which fails with top-level await
2. **Can't use `module` externals** - The webpack target (`node`) doesn't support ESM module externals
3. **Solution: Dynamic import with webpackIgnore** - We use:
   ```typescript
   await import(/* webpackIgnore: true */ '../cdt_mcp/main.js')
   ```
   This tells webpack to leave the import alone, and Node.js handles it at runtime.

### Updating chrome-devtools-mcp

To update to a new version:

1. Update the version in `package.json`
2. Run `npm install` - this will apply the patch and copy files
3. If the patch fails, update `patches/chrome-devtools-mcp+0.12.1.patch`:
   ```bash
   # Make changes to node_modules/chrome-devtools-mcp/src/main.ts
   # Then regenerate the patch:
   npx patch-package chrome-devtools-mcp
   ```

### The Patch

The patch modifies `src/main.ts` to:
- Wrap the server creation in an exported `createServer()` function
- Export `args` for configuration
- Remove the auto-start code (stdio transport, connect, etc.)

This allows the extension to import and configure the server programmatically.

## How It Works

### 1. Extension Activation
On activation, the extension:
- Dynamically imports the `cdt_mcp` module (ESM with top-level await)
- Fetches the CDP port from Unified State Sync
- Starts the MCP server with HTTP/SSE transport
- Registers commands for the Language Server to get the MCP URL

### 2. MCP Server
- Dynamically imported from `cdt_mcp/main.js` using `/* webpackIgnore: true */`
- Configured with `args.browserUrl` to connect to Chrome via CDP
- Runs on a dynamic port
- Automatically restarts on errors with exponential backoff

### 3. Command Registration
Registers `antigravity.getChromeDevtoolsMcpUrl` command that returns the MCP server URL.

## Development

### Building
```bash
npm install  # Applies patch and copies cdt_mcp/
npm run compile
```

### Testing Changes to chrome-devtools-mcp
If you need to modify the chrome-devtools-mcp source:
1. Edit files in `node_modules/chrome-devtools-mcp/src/`
2. Run `npx patch-package chrome-devtools-mcp` to update the patch
3. Run `npm install` to regenerate `cdt_mcp/`

## Version

Current version: **0.12.1**
