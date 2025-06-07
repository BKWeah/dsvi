#!/bin/bash
# Cloudflare Pages build script

# Install bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

# Install dependencies and build
bun install
bun run build
