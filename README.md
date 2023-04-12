# mdsite
A modern generator for old-school static sites

`mdsite` lets you take pretty much any directory structure of Markdown files and, with no modification to the files themselves,
generate a browsable HTML website along the lines of http://catb.org/esr/writings/taoup/html/. That means:

- You can define your own HTML templates into which the markdown gets rendered.
- Templates can include automatically-generated portions, like a table of contents.
- The contents of a directory are ordered: either they are ordered implicitly by filename, or explicitly via a config file. This allows tables of contents to work sensibly.
- Every page can have "home", "up", "previous", and "next" links. These work as you'd expect.

## Killer Feature

All generated internal links are *relative*, so you can deploy your site to a subdirectory of your domain, and it will just work.

## Usage

Run `mdsite build` passing the input and output directories as arguments.

```
mdsite build INPUTDIR OUTPUTDIR [-t TEMPLATEDIR]
```

The `TEMPLATEDIR` contains HTML templates; if not provided, simple default templates will be used.

## Input Format

### Directory Structure

The `TEMPLATEDIR` passed to `mdsite` should contain HTML files. They may be organized into subdirectories.

Two HTML files are special:

- `TEMPLATEDIR/index.html` is used for index pages (those whose source files are named `index.md`).
- `TEMPLATEDIR/page.html` is used for other pages.

These defaults can be overridden on a per-page basis (see the section on frontmatter below).

### Template Language

Template files are HTML that may contain references to mdsite *commands* between double curly braces.

```html
<!DOCTYPE html>
<html>
  <head>
    <title>{{title}}</title>
  </head>
  <body>
    <nav>{{toc .}}</nav>
    <article>{{content}}</article>
    <footer>{{prev}} | {{up}} | {{home}} | {{next}}</footer>
  </body>
</html>
```

Currently, all commands are built into `mdsite`, though in the future there may be plugin-provided commands.

Arguments can be provided to commands using bare words or quoted strings. All arguments are passed to the function
that implements the command as strings, so e.g. `{{mycommand 1}}` and `{{mycommand "1"}}` are equivalent.

Commands execute with knowledge of:

- the path of the Markdown file being rendered, relative to `INPUTDIR`
- the content of the Markdown file being rendered
- the paths of the "previous" and "next" files according to `toc.txt` (see below), relative to `INPUTDIR`.
