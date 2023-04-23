# A Hello World Site

This tutorial assumes you've [installed mdsite](../installation.md).

## Step 1: Create a `src/` directory and an `index.md` file

```bash
mkdir src
echo '# Hello, world!' > src/index.md
```

## Step 2: Run `mdsite`

While still in the directory that contains your `src` directory, run
`mdsite`.

To check that it worked, list the entries in your current directory with `ls`.
You should see the `docs` directory that `mdsite` generated.

## Step 3: Serve

Run `bunx http-server -p 3000 docs` to serve your docs folder to your
local network over HTTP.

You should now be able to visit [http://localhost:3000](http://localhost:3000)
and see the page that `mdsite` built!

## Step 4: Customize the page

Edit your `index.md` in the editor of your choice. Then run `mdsite` again
to apply the updates.
