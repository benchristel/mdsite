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

```
bunx http-server -p 3000 docs
```

to serve your docs folder to your local network over HTTP.

You should now be able to visit [http://localhost:3000](http://localhost:3000)
and see the homepage that `mdsite` built! It will have a link to your
hello world page.
