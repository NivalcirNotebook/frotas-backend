@echo off
node node_modules\prisma\build\index.js db push
node node_modules\prisma\build\index.js generate
