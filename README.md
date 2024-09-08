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

## Development

### TODO

- Bug: `.md` extensions shouldn't be replaced with `.html` in external link URLs
- Change `template.html` convention to `_template.html`, `order.txt` to `_order.txt`, to avoid conflicting
  with first-party files, and to make these special files more visible in an explorer/tree view.
- Allow raw HTML: if file starts with `<html` or `<!doctype` (case-insensitive), don't templatize it.
- Authors should be able to customize the home URL and link text on a `{{breadcrumb}}`. E.g. `{{breadcrumb --home-url /hello.html --home-text "🛖"}}`
- Authors should have some way to use different templates or different CSS files per page/subtree
  - Proposal 1: `_template.html` per directory, applies to .md files within that directory.

### Tools

```bash
yarn          # install dependencies and set up repo for development
yarn test     # run unit tests
yarn serve    # start dev server
yarn ts       # start typechecker
yarn verify   # run all checks
yarn version  # cut a release
```