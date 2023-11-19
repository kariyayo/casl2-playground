#!/bin/sh

mkdir -p out
cd out
emcmake cmake ..
make
cd ..

cp frontend/wasm_machine.js ../web/lib
cp out/casl2interpriter.js out/casl2interpriter.wasm ../web/public/js/

