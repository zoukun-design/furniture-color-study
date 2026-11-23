#!/usr/bin/env bash
# Puts src/sensei.js into index.html (the block from "// ---- Suzaki sensei: a little life in the model." up to "render();photos();").
# Always edit src/sensei.js, never that block in index.html; run this after every change to it.
set -e
cd "$(dirname "$0")/.."
node --check src/sensei.js
python3 - <<'PY'
s=open('index.html').read()
a=s.index('// ---- Suzaki sensei: a little life in the model.');b=s.index('render();photos();',a)
s=s[:a]+open('src/sensei.js').read().rstrip()+'\n'+s[b:]
open('index.html','w').write(s)
PY
echo built
