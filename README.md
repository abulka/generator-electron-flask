# generator-electron-flask [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]
> electron app starter with flask subprocess incl. pyinstaller packaging 

## Installation

First, install [Yeoman](http://yeoman.io) and generator-electron-flask using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-electron-flask
```

or from GitHub

```bash
$ git clone https://github.com/abulka/generator-electron-flask
$ cd generator-electron-flask
$ npm link
```

Then generate your new project:

```bash
yo electron-flask
```

## Getting To Know Yeoman

 * Yeoman has a heart of gold.
 * Yeoman is a person with feelings and opinions, but is very easy to work with.
 * Yeoman can be too opinionated at times but is easily convinced not to be.
 * Feel free to [learn more about Yeoman](http://yeoman.io/).

## License

Apache-2.0 © [Andy Bulka]()


[npm-image]: https://badge.fury.io/js/generator-electron-flask.svg
[npm-url]: https://npmjs.org/package/generator-electron-flask
[travis-image]: https://travis-ci.com/abulka/generator-electron-flask.svg?branch=master
[travis-url]: https://travis-ci.com/abulka/generator-electron-flask
[daviddm-image]: https://david-dm.org/abulka/generator-electron-flask.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/abulka/generator-electron-flask

# TODO

Dot files are touch, but .gitignore is especially tough, and I've used this syntax to get over this issue:

```js
this.fs.copyTpl(
      `${this.templatePath()}/**/.!(gitignore)*`,
      this.destinationRoot(),
      this.props
    );

    this.fs.copyTpl(
      this.templatePath('.gitignorefile'),
      this.destinationPath(`.gitignore`),
      this.props
    );
```
