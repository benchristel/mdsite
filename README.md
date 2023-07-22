# @benchristel/mdsite

A modern generator for old-school static sites. Under construction!

`mdsite` generates an HTML website from any tree of Markdown files.

[**@benchristel/mdsite on NPM**](https://www.npmjs.com/package/@benchristel/mdsite)

## Quick Start

Create a directory for your project to live in:

```bash
mkdir my-first-mdsite
cd my-first-mdsite
```

Create a markdown file in a `src` directory:

```bash
mkdir src
cat <<<'
# Welcome to My Website
Pretty cool, right?
' > src/welcome.md
```

Compile it to HTML:

```bash
npx @benchristel/mdsite
```

mdsite will create a `docs` folder with the compiled HTML. You'll see a warning about a missing template file; that's okay.

Serve the website locally:

```bash
npx http-server -c-1 -o docs -p 8080
```

The site should open in your browser automatically. If it doesn't, visit
http://localhost:8080.

## Installation

```
npm install -g @benchristel/mdsite
```

After installing, you should be able to run `mdsite` anywhere.

## Documentation

See [benchristel.github.io/mdsite](https://benchristel.github.io/mdsite).
