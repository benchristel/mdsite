# List of Macros

- [`{{macro content}}`](#macro-content)
- [`{{macro title}}`](#macro-title)
- [`{{macro toc}}`](#macro-toc)
- [`{{macro next}}`](#macro-next)
- [`{{macro prev}}`](#macro-prev)
- [`{{macro up}}`](#macro-up)
- [`{{macro home}}`](#macro-home)
- [`{{macro breadcrumb}}`](#macro-breadcrumb)
- [`{{macro macro ...args}}`](#macro-macro)

## `{{macro content}}`

Expands to the HTMLified content of the current page. Macros in the HTML content are expanded.

You should only use `{{macro content}}` in template files. Using it in content files will result
in infinite recursion.

## `{{macro title}}`

Expands to the text content of the first `<h1>` element on the page, or the filename if there
is no `<h1>`.

`{{macro title}}` is mostly useful in the `<title>` element of template files. Note that `mdsite`
reuses the `{{macro title}}` logic internally to generate the titles of navigation links, e.g. in `{{macro toc}}` and `{{macro breadcrumb}}`.

## `{{macro toc}}`

Generates a table of contents. With no arguments, it generates a TOC for the current page's directory and its subdirectories.

You can optionally specify the directory whose table of contents you want to generate. This must be an absolute path, which `mdsite` will interpret, as always, as relative to the source root.

For example, to generate the TOC for the whole site, you could use `{{macro toc /}}`.

## `{{macro next}}`

Generates a link to the next page on the site. The order of pages is determined by [order.txt](./order) files.

## `{{macro prev}}`

Generates a link to the previous page on the site. The order of pages is determined by [order.txt](./order) files.

## `{{macro up}}`

Generates a link to the parent of the current page.

If the current page is a leaf (e.g. `foo.md`), its parent is the index page in the same directory.

If the current page is an index (`index.md` or `index.html`), its parent is the index page one level up in the directory tree.

## `{{macro home}}`

Generates a link to the root index page, `/index.html`.

## `{{macro breadcrumb}}`

Generates a breadcrumb that links to all ancestors of the current page.

## `{{macro macro ...args}}`

Expands to the literal `...args`. For example,
`{{macro macro foo bar}}` expands to `{{macro foo bar}}`. Quotes are preserved,
so <code>{{macro macro foo "bar"}}</code> expands to <code>{{macro foo "bar"}}</code>
