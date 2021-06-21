# Linux App Building Notes

 On Linux double click on the final electron executable will probably fail. You will either have to launch the final electron executable via the command line using `bin/runelectron-exe` or build a desktop launcher file for this electron app. See my [desktop launcher notes](doco/desktop-launcher-tips.md). Alternatively you can also build a ubuntu snap by adding an entry to the generated `package.json` under the `"makers":` JSON key - for more information see https://www.electronforge.io/config/makers and my notes below.

In the generated `package.json` these are the default entries for making linux executables:

```json
{
    "name": "@electron-forge/maker-deb",
    "config": {}
},
{
    "name": "@electron-forge/maker-rpm",
    "config": {}
},
```

# Building a Snap

Install some pre-requisites:

    sudo snap install snapcraft --classic
    sudo snap install multipass
    npm i @electron-forge/maker-snap --save-dev

Here is an example maker entry for `package.json`:

```json
      {
         "name": "@electron-forge/maker-snap",
         "config": {
           "icon": "bacteria.png",
           "features": {
             "webgl": true
           },
           "summary": "Pretty Awesome"
         }
       }
```

The `"webgl": true` is not needed.

Currently I cannot get snaps to build.

- https://github.com/electron-userland/electron-forge/issues/1652
- https://github.com/electron-userland/electron-installer-snap/issues/83

