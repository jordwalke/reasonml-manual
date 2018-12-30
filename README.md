
# Reason OCaml Language Reference.


This is a Reason version of the official OCaml language manual.

This will not contain a modified version of the OCaml language manual but will
contain a build process that can generate Reason-ified versions of arbitrary
manual versions.

It contains a snapshot of the HTML files from version 4.06 of the OCaml
compiler, but we should change the build script to download it on the fly
before converting them.

Generating the markdown files into `docs/`.
```
yarn install
node convertman.js
```

Starting the server:
```
mkdir -p docs/libref
cd website
npm start
```
