#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Instale o Node.js 22.13 ou superior."
  exit 1
fi
node -e "var v=process.versions.node.split('.').map(Number); if(v[0]<22 || (v[0]===22 && v[1]<13)) process.exit(1)"
if [[ ! -f node_modules/.modules.yaml ]]; then
  npx --yes --package pnpm@11.25.0 pnpm install --frozen-lockfile
fi
printf '\nQuando o servidor estiver pronto, abra http://localhost:5173\n'
npx --yes --package pnpm@11.25.0 pnpm dev
