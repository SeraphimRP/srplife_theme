# srplife_theme

Theme for my Ghost blog at [srp.life](https://srp.life).

The old theme can be found in the prometheus branch.

## Usage

Clone the repo, `npm install`, then `npm run zip`. Upload `dist/srplife.zip` to Ghost. ???. Profit.

## Development

There's a handful of options to help with development.

### Preview

`npm run preview` will build the theme with the contents of a Ghost export file, generating a preview of the theme in the `preview` directory. You can open `preview/index.html` in your browser to see the theme in action, albeit with some broken images, links, and some Ghost-specific markup that doesn't render.

It's enough to avoid running a local Ghost instance just for the sake of testing.

### CSS

`npm run build:css` will build the CSS from the SCSS files in `assets/css/src` and output it to `assets/css/screen.css`. `npm run dev:css` will do the same, but watch for changes and rebuild on the fly.


