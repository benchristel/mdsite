# mdsite
A modern generator for old-school static sites

`mdsite` lets you take pretty much any directory structure of Markdown files and, with no modification to the files themselves,
generate a browsable HTML website along the lines of http://catb.org/esr/writings/taoup/html/. That means:

- You can define your own HTML templates into which the markdown gets rendered.
- Templates can include automatically-generated portions, like a table of contents.
- The contents of a directory are ordered: either they are ordered implicitly by filename, or explicitly via a config file. This allows tables of contents to work sensibly.
- Every page can have "home", "up", "previous", and "next" links. These work as you'd expect.
