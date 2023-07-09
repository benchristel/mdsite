# A Hello World Site

This tutorial assumes you've [installed mdsite](../installation.md).

## Step 1: Create a directory for your project

```bash
cd ~/Desktop
mkdir mdsite-tutorial
cd mdsite-tutorial
```

Optionally, initialize a git repository so you can version your site
and deploy it to [GitLab Pages](https://docs.gitlab.com/ee/user/project/pages/)
or [GitHub Pages](https://pages.github.com/):

```
git init
```

## Step 2: Create a `src/` directory and a `hello.md` file

```bash
mkdir src
echo '# Hello, world!' > src/hello.md
```

## Step 3: Run `mdsite`

While still in the directory that contains your `src` directory, run:

```bash
mdsite
```

You'll see a warning about `template.html` not existing; that's fine.

To check that it worked, list the entries in your current directory with `ls`.
You should see the `docs` directory that `mdsite` generated.

## Step 4: Serve

Run:

```bash
npx http-server -o -c-1 -p 3000 docs
```

to serve your docs folder to your local network over HTTP.

You should now be able to visit [http://localhost:3000](http://localhost:3000)
and see the homepage that `mdsite` built! It will have a link to your
hello world page.

## What Just Happened?

By default, `mdsite` reads Markdown files from the `src` directory and generates HTML in a `docs` directory.

In this tutorial, we created a single Markdown file `src/hello.md` with no mdsite-specific formatting. `mdsite` built us a small but complete website, including an index page with a link to our `hello` page.

This demonstrates the power of `mdsite` to produce usable output with zero configuration. However, we've just scratched the surface of what `mdsite` can do. In future tutorials, we'll see how to theme our site with custom templates and CSS. We'll also learn how to add tables of contents and breadcrumbs like the ones on this page.