/* eslint-disable capitalized-comments */
"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");
const path = require("path");

// Copied from node_modules/generator-license/app/index.js
const licenses = [
  { name: "Apache 2.0", value: "Apache-2.0" },
  { name: "MIT", value: "MIT" },
  { name: "Mozilla Public License 2.0", value: "MPL-2.0" },
  { name: "BSD 2-Clause (FreeBSD) License", value: "BSD-2-Clause-FreeBSD" },
  { name: "BSD 3-Clause (NewBSD) License", value: "BSD-3-Clause" },
  { name: "Internet Systems Consortium (ISC) License", value: "ISC" },
  { name: "GNU AGPL 3.0", value: "AGPL-3.0" },
  { name: "GNU GPL 3.0", value: "GPL-3.0" },
  { name: "GNU LGPL 3.0", value: "LGPL-3.0" },
  { name: "Unlicense", value: "unlicense" },
  { name: "No License (Copyrighted)", value: "UNLICENSED" }
];

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
        type: "list",
        name: "license",
        message: this.options.licensePrompt,
        default: this.options.defaultLicense,
        when:
          !this.options.license ||
          licenses.find(x => x.value === this.options.license) === undefined,
        choices: licenses
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
        name: "launchFlask",
        message: "Would you like to launch flask server on electron startup?",
        default: true
      },
      {
        name: "portFlask",
        type: "number",
        message: "Run flask on port number?",
        default: 5000
      },
      {
        type: "checkbox",
        name: "misc",
        message: "Choose from misc options",
        choices: [
          { name: "Electron logging", value: "electronLog" },
          {
            name: "Kill flask server on electron exit",
            value: "killFlask"
            // disabled: !this.props.launchFlask
          },
          { value: "reportCwd" },
          { value: "reportVersions" },
          {
            name: "Fully quit on Mac on exit (without needing CMD-Q)",
            value: "macFullyQuit"
          },
          {
            name: "Demo button on main page calling Flask endpoing",
            value: "demoVueMain"
          }
        ],
        default: [
          "electronLog",
          "killFlask",
          "reportCwd",
          "reportVersions",
          "macFullyQuit",
          "demoVueMain"
        ]
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    // hack in some value during devel
    // this.props.name = "myapp";
    // this.props.description = "";
    // this.props.authorName = "";
    // this.props.authorEmail = "";
    // this.props.license = "MIT";
    // this.props.keywords = "";

    // Begin
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
    const files = [
      "package.json",
      "src/index.js",
      "src/index.html",
      "src-flask-server/app.py",
      "src-flask-server/static/js/hello.js",
      "bin/whos-on-flask-port",
      "bin/whos-on-flask-port.bat",
      "bin/whos-on-flask-port.ps1",
      "bin/runelectron-exe",
      "bin/runelectron-exe.bat",
      "bin/runflask-exe-inside-electron",
      "bin/runflask-exe-inside-electron.bat"
    ];
    const context = {
      name: this.props.name,
      description: this.props.description,
      authorName: this.props.authorName,
      authorEmail: this.props.authorEmail,
      license: this.props.license,
      keywords: this.props.keywords,
      launchFlask: this.props.launchFlask,
      portFlask: this.props.portFlask,
      killFlask: this.props.misc.includes("killFlask"),
      electronLog: this.props.misc.includes("electronLog"),
      reportVersions: this.props.misc.includes("reportVersions"),
      reportCwd: this.props.misc.includes("reportCwd"),
      demoVueMain: this.props.misc.includes("demoVueMain"),
      macFullyQuit: this.props.misc.includes("macFullyQuit")
    };
    files.forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file),
        this.destinationPath(`${this.props.name}/${file}`),
        context,
        copyOpts
      );
    });
    this._copyGitIgnore();
  }

  _copyGitIgnore() {
    this.fs.copyTpl(
      this.templatePath(".gitignorefile"),
      this.destinationPath(`${this.props.name}/.gitignore`),
      this.props
    );
  }

  install() {
    let venvPythonPath =
      process.platform === "win32"
        ? "venv\\scripts\\python.exe"
        : "venv/bin/python";

    const appDir = path.join(process.cwd(), this.props.name);
    process.chdir(appDir);

    // venv
    console.log("Creating python venv...");
    this.spawnCommandSync("python", ["-m", "venv", "venv"]);

    console.log("Upgrading pip...");
    this.spawnCommandSync(venvPythonPath, [
      "-m",
      "pip",
      "install",
      "--upgrade",
      "pip"
    ]);

    console.log("Installing python requirements...");
    this.spawnCommandSync(venvPythonPath, [
      "-m",
      "pip",
      "install",
      "-r",
      "requirements.txt"
    ]);

    // this.installDependencies();
    // this.npmInstall();
    console.log("Installing node modules...");
    this.spawnCommandSync("npm", ["install"]);

    console.log(`Now 'cd ${this.props.name}'`);
    console.log(
      `and run 'bin/run' to build the electron app and flask server app...`
    );
  }
};
