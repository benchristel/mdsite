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

## Basic Usage

To build a website from a directory of markdown files, run:

```
mdsite [-i INPUTDIR] [-o OUTPUTDIR] [-t TEMPLATEFILE]
```

Where `INPUTDIR` and `OUTPUTDIR` are paths to directories. `OUTPUTDIR` will
be created if it does not exist. `INPUTDIR` defaults to `src`, and `OUTPUTDIR`
to `docs`. `TEMPLATEFILE` is the path to an HTML file. If not given, it defaults
to `template.html`, and if that file is not found, `mdsite` will use a built-in
default template.

Files already in `OUTPUTDIR` will not be deleted; if they do not need to be
updated, `mdsite` will simply leave them in place. This may be valuable if you want
users to be able to permalink to your webpages—that is, if you want links into
your site to continue to resolve even if you delete the source file. This
can be a confusing user experience, though: if you're on one of these "zombie
pages", clicking the "next" link followed by "previous" probably won't go
back to the page you were on. To prevent this from happening, you can delete
`OUTPUTDIR` before running `mdsite`.

## Input Format

`mdsite` can be thought of as a recursive copy command (like `cp -r`) that does
some processing of the file contents as they're copied from `INPUTDIR` to `OUTPUTDIR`.
Most file types (`.js`, `.css`, `.jpg`, `.png`, etc.) are simply copied with no processing.

Files in `INPUTDIR` that have an `.md` or `.html` extension _will_ be processed.
If the file is markdown, it gets compiled to HTML. Then the HTML is inserted into
a _template_, which by default just wraps the content in bare-bones
HTML boilerplate. Here is the default template:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{title}}</title>
  </head>
  <body>
    {{content}}
    <nav>
      {{home}} | {{up}} | {{prev}} | {{next}}
    </nav>
  </body>
</html>
```

`{{title}}` and `{{content}}` are _macros_. They instruct
`mdsite` to insert some data into the page.

- `{{content}}` inserts the content of the source file.
- `{{title}}` inserts the content of the first `<h1>` element on the page,
  or the filename if there is no `<h1>`.

## Custom Templates

You can customize the HTML template for your pages by creating a `template.html` file
in the directory where you run `mdsite`.

## Macros

The available macros are:

- `{{content}}` inserts the content of the source file.
- `{{title}}` inserts the content of the first `<h1>` element on the page,
  or the filename if there is no `<h1>`.
- `{{toc}}` inserts a table of contents for the current directory and
  subdirectories.
- `{{next}}` creates a link to the next page. The order of pages is determined by the
  set of `order.txt` files (see below).
- `{{prev}}` creates a link to the previous page. The order of pages is determined by the
  set of `order.txt` files (see below).
- `{{up}}` creates a link that goes one level up in the hierarchy. If used on a "leaf" page,
  it goes to the sibling `./index.html` file; if used on an index page, it goes to `../index.html`.
- `{{home}}` links to the root `/index.html` file.

You can use most of these macros anywhere—in your template file, or in HTML or markdown content.
The exception to this is `{{content}}`, which should only be used in the template file.

All of the generated links are relative, making it safe to deploy your site to
a subdirectory of your domain.

## Table of Contents, `{{toc}}` and order.txt

`{{toc}}` is a macro which inserts a table of contents formatted as a nested
list. `{{toc}}` recursively lists the files and directories within the current file's
parent directory.

By default, entries in the table of contents are ordered lexicographically by
title. You can customize the ordering of the entries in a directory by creating
an `order.txt` file in that directory. The `order.txt` file simply lists the
entries (files or directories) in the order you want them
displayed, one per line. E.g.

```
foo.md
bar.md
baz.md
quux
kludge
```

Any files you don't list in `order.txt` will be ordered by title, after the
listed files.

Each `order.txt` file can only affect the order of its sibling
files/directories; `order.txt` can't reach into subdirectories. Any lines in
`order.txt` that contain a slash are ignored.

To populate your INPUTDIR with `order.txt` files, you can run
`mdsite order [-i INPUTDIR]`. This does the following:

- Creates an `order.txt` in each directory that lacks one.
- Appends any missing files and folders to each `order.txt`, below an
  `!unspecified` line which causes them to be ignored when sorting
  files.

Running `mdsite order` won't mess with the filenames you've listed
manually, and won't affect the overall order of the pages on your site.