# mdsite

A modern generator for old-school static sites. Under construction!

`mdsite` generates an HTML website from any tree of Markdown files.

## Installation

You will need to install [Bun](https://bun.sh) first. Then:

```
git clone https://github.com/benchristel/mdsite
cd mdsite
bun install
```

Put the `mdsite` directory on your `PATH` somehow, probably by adding
a line like the following to your `.bashrc`:

```
export PATH="$PATH:/path/to/mdsite"
```

## Usage

To build a website from a directory of markdown files, run:

```
mdsite [-i INPUTDIR] [-o OUTPUTDIR]
```

Where `INPUTDIR` and `OUTPUTDIR` are paths to directories. `OUTPUTDIR` will
be created if it does not exist. `INPUTDIR` defaults to `src`, and `OUTPUTDIR`
to `docs`.
