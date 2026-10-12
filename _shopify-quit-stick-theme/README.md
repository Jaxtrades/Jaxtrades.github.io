# Quit Stick — Shopify theme

A standalone Online Store 2.0 theme for the Quit Stick store. It sits beside the store's existing themes:
uploading it adds a new **unpublished** theme and doesn't change the live one. The folder name starts with
`_`, so GitHub Pages doesn't publish it.

## Install

1. Shopify admin → **Online Store → Themes → Add theme → Upload zip file**.
2. Choose `_shopify-quit-stick-theme.zip` from the repo root (or zip the folders in this directory, with
   `assets/`, `config/` etc. at the top level of the zip).
3. Click **Customize** to preview and edit it. Only click **Publish** when you want it to replace the live theme.

## What's in it

- **Home page:** hero, stats strip, benefits, starter kit with finish swatches and add to cart, how it works,
  flavours, image with text, comparison table, FAQ, Quitline support banner and newsletter sign-up. It's
  wired to the `quit-stick-starter-kit` product.
- **Product page:** gallery, finish swatches (Walnut, Natural, Black, Silver), quantity, dynamic checkout
  buttons, and product structured data for search engines.
- **Cart drawer:** slides out on add to cart, has a free-shipping progress bar, and lets shoppers change
  quantities without leaving the page.
- **18+ age check:** a one-time popup, which you can turn off in Theme settings → Age check.
- **Other pages:** collection, collections list, cart, search, page, contact, blog, article, 404, password
  and gift card templates.

## Editing

- Colours, page width, corner radius, free-shipping threshold and social links are in **Theme settings**.
- Every home page section and block can be reordered and edited in the theme editor.
- Header menu: `main-menu`. Footer menus: `main-menu` and `footer`.

## Check

```sh
npx @shopify/cli theme check --path _shopify-quit-stick-theme
```
