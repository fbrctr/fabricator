# Using Bower for dependency managment

[Bower](http://bower.io) is a great tool for managing third party client side dependencies. Here's how to leverage Bower on a Fabricator instance:

1. Install bower `$ npm install bower --save-dev`
2. Add a `.bowerrc` config file (see below).
3. Update `package.json` `scripts` object to hook into Bower install task.
4. Refer to the [vendor script recipe](https://github.com/resource/fabricator/blob/master/recipes/vendor-scripts.md) for steps on including these scripts into your `toolkit.js` file.

**.bowerrc**
```json
{
  "directory": "src/toolkit/assets/vendor"
}
```

**package.json**

```json
"scripts": {
  "gulp": "gulp",
  "bower": "bower",
  "prestart": "npm install",
  "build": "npm install && gulp",
  "postinstall": "bower install",
  "start": "gulp --dev"
},
```
