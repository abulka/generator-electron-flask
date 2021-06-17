/* eslint-disable capitalized-comments */
"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const path = require("path");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the amazing ${chalk.red(
          "generator-electron-flask"
        )} generator!`
      )
    );

    const prompts = [
      {
        type: "input",
        name: "name",
        message: "App Name",
        default: "myapp"
      },
      {
        name: "description",
        message: "Description",
        default: "My Electron application description"
        // when: !this.props.description
      },
      {
        name: "authorName",
        message: "Author's Name",
        // when: !this.props.authorName,
        default: this.user.git.name(),
        store: true
      },
      {
        name: "authorEmail",
        message: "Author's Email",
        // when: !this.props.authorEmail,
        default: this.user.git.email(),
        store: true
      },
      {
        name: "keywords",
        message: "Package keywords (comma to split)",
        // when: !this.pkg.keywords,
        filter(words) {
          return words.split(/\s*,\s*/g);
        }
      },
      {
        type: "confirm",
        name: "someAnswer",
        message: "Would you like to enable this option?",
        default: true
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    const src = this.sourceRoot();
    const dest = this.destinationPath(`${this.props.name}`);

    // The ignore array is used to ignore files, push file names into this array that you want to ignore.
    const copyOpts = {
      globOptions: {
        ignore: []
      }
    };

    copyOpts.globOptions.ignore.push(src + "/dummyfile.txt");

    // This copies everything in templates/ dir into destinationPath. No template substitution though.
    this.fs.copy(src, dest, copyOpts);

    // Add template substitution
    const files = ["package.json"];
    const context = {
      name: this.props.name,
      description: this.props.description,
      authorName: this.props.authorName,
      authorEmail: this.props.authorEmail,
      keywords: this.props.keywords
    };
    files.forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(`${this.props.name}/${file}`),
        context,
        copyOpts
      );
    });
  }

  install() {
    // this.installDependencies();
    const appDir = path.join(process.cwd(), this.props.name);
    process.chdir(appDir);
  }
};
