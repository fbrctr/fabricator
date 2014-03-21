# Fabricator

> _fabricate_ - to make by assembling parts or sections.

Fabricator is a tool for creating modular websites.

## Sass Support

There is an option for the Sass CSS precompiler.  **`sassGem`** in gulpfile.js is used to determine if `gulp-sass` or `gulp-ruby-sass` is used compiling Sass.

/**
 * Sass CSS precompiler Options
 1) `gulp-ruby-sass`
   * Dependencies: Ruby and Sass gem  - [install](http://sass-lang.com/install)
   * Support for latest version of Sass
 2) `gulp-ruby-sass`
   * Dependencies: No additional dependencies
   * Uses [Libsass](https://github.com/hcatlin/libsass) - C/C++ port of the Sass CSS precompiler
   * Lighter than full Sass gem but does not include all latest functionality of Sass
 */
var sassGem = false;


## Documentation

[Check out the wiki](https://github.com/resource/fabricator/wiki).

## Credits

Created by [Luke Askew](http://lukeaskew.com).

Logo by Tim Vonderloh.

Icons borrowed from [SteadySets](http://dribbble.com/shots/929153-Steady-set-of-icons?list=show) and [Font Awesome](http://fortawesome.github.io/Font-Awesome/).

Code syntax highlighting by [Prism](http://prismjs.com/).

## License

[Copyright (c) 2014 Resource LLC](https://github.com/resource/fabricator/blob/master/LICENSE.md)
