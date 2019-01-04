
# Reason OCaml Language Reference.


This is a Reason version of the official OCaml language manual.

### Why:
Just to make reading the OCaml manual easier for Reason developers.
This isn't supposed to be "The Reason Manual" at all. It will largely
be a subset of the OCaml manual, removing anything related to syntax,
ocamlbuild, and other less-useful things. It will mostly be a language
guide for the type system, compiler, and most of the OCaml standard
library.

### What:

This will not contain a modified version of the OCaml language manual but will
contain a build process that can generate Reason-ified versions of arbitrary
manual versions.

It contains a snapshot of the HTML files from version 4.06 of the OCaml
compiler, but we should change the build script to download it on the fly
before converting them.

Generating the markdown files into `docs/`.
```
yarn install
mkdir -p docs/libref
node convertman.js
```

Starting the server:
```

cd website
yarn install
npm start
```
