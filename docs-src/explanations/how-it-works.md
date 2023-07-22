# How `mdsite` Works

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
    <title>{{macro title}}</title>
  </head>
  <body>
    {{macro content}}
    <nav>
      {{macro home}} | {{macro up}} | {{macro prev}} | {{macro next}}
    </nav>
  </body>
</html>
```

`{{macro title}}` and `{{macro content}}` are _macros_. They instruct
`mdsite` to insert some data into the page.

- `{{macro content}}` inserts the content of the source file.
- `{{macro title}}` inserts the content of the first `<h1>` element on the page,
  or the filename if there is no `<h1>`.

## Custom Templates

You can customize the HTML template for your pages by creating a `template.html` file
in the directory where you run `mdsite`.

## Macros

The available macros are:

- `{{macro content}}` inserts the content of the source file.
- `{{macro title}}` inserts the content of the first `<h1>` element on the page,
  or the filename if there is no `<h1>`.
- `{{macro toc}}` inserts a table of contents for the current directory and
  subdirectories.
- `{{macro next}}` creates a link to the next page. The order of pages is determined by the
  set of `order.txt` files (see below).
- `{{macro prev}}` creates a link to the previous page. The order of pages is determined by the
  set of `order.txt` files (see below).
- `{{macro up}}` creates a link that goes one level up in the hierarchy. If used on a "leaf" page,
  it goes to the sibling `./index.html` file; if used on an index page, it goes to `../index.html`.
- `{{macro home}}` links to the root `/index.html` file.

You can use most of these macros anywhere—in your template file, or in HTML or markdown content.
The exception to this is `{{macro content}}`, which should only be used in the template file.

All of the generated links are relative, making it safe to deploy your site to
a subdirectory of your domain.

## Table of Contents, `{{macro toc}}` and order.txt

`{{macro toc}}` is a macro which inserts a table of contents formatted as a nested
list. `{{macro toc}}` recursively lists the files and directories within the current file's
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