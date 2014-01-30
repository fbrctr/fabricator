# Fabricator
A toolkit for creating UI toolkits. 

---

*This README is a work in progress. More detail will be added as the project matures.*

---

Fabricator provides an environment for developers to create modular interfaces. 

> _fabricate_ - to make by assembling parts or sections.

## Features

- Simple, straightforward nomenclature
- Real-time (livereload) development environment
- Highly customizable
- Automatic documentation
- Toolkit scaffold
    + AMD toolkit.js file
    + toolkit.js build script
- Compiles to static HTML - no server-side or database dependencies


## Getting started

1. Run `npm install`
2. Run `bower install`

### Developing

Fire up the development environment by running `grunt serve`.

Start building your toolkit in the `src/toolkit` directory.

Add **components** and **structures** by adding new `.html` files to the respective directories.

Add new pages by adding `.html` files to the `src/views` directory.

Add new partials by adding `.html` files to the `src/views/partials` directory.

Out of the box, Fabricator using Handlebars for templating.


### Building

Create a build of your toolkit by running `grunt`.

This compiles both the site and the toolkit to the `dist/` directory.

The toolkit Sass is compiled and compressed.

The toolkit JavaScript is concatenated using r.js. An additional step strips out the `require` and `define` invocations and wraps the whole script in a closure. This produces one comprehensive toolkit.js without external dependencies (require.js).


### How to use your toolkit

Toolkits are meant to be drop-in solutions for rapidly developing UI.

You should be able to include your `toolkit.css` and `toolkit.js` files in a document, and use the markup for your components and solutions. 


## Why Fabricator?

- Highly collaborative real-time development environment (live reload, design in browser)
- Minimally invasive (just enough to get you going, unobtrusive style)
- Toolkit architecture
- Automatic
- JS end-to-end stack
- Familiar tools (grunt, sass, handlebars)
- OPENs process of creation with stakeholders
- Exposes the design system behind the website; client insight into how the sausage get made.
