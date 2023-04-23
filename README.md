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

## Basic Usage

To build a website from a directory of markdown files, run:

```
mdsite [-i INPUTDIR] [-o OUTPUTDIR]
```

Where `INPUTDIR` and `OUTPUTDIR` are paths to directories. `OUTPUTDIR` will
be created if it does not exist. `INPUTDIR` defaults to `src`, and `OUTPUTDIR`
to `docs`.

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

`{{title}}` and `{{content}}` are _macros_—more on those later. They instruct
`mdsite` to insert some data into the page.

- `{{content}}` inserts the content of the source file.
- `{{title}}` inserts the content of the first `<h1>` element on the page,
  or the filename if there is no `<h1>`.

## Tables of Contents

Currently, the only macro other than `{{title}}` and `{{content}}` is
`{{toc}}`, which inserts a table of contents formatted as a nested list.
`{{toc}}` lists the files within the current file's parent directory.

By default, entries in the table of contents are ordered lexicographically by
title. You can customize the ordering of the files in a directory by creating
an `order.txt` file in that directory. The `order.txt` file simply lists the
files in the order you want them displayed, one per line. E.g.

```
foo.md
bar.md
baz.md
```

Any files you don't list in `order.txt` will be ordered by title, after the
listed files.

To populate your INPUTDIR with `order.txt` files, you can run
`mdsite order [-i INPUTDIR]`. This does the following:

- Creates an `order.txt` in each directory that lacks one.
- Appends any missing files and folders to each `order.txt`, below an
  `!unspecified` line which causes them to be ignored when sorting
  files.

Running `mdsite order` won't mess with the filenames you've listed
manually, and won't affect the overall order of the pages on your site.