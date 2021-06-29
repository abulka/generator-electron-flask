# Electron launching Flask

The main idea of this electron-flask project is the idea that electron auto launches a flask server when it runs. 🎉

## vscode debugging considerations

However when launching electron via vscode, you must launch the flask independently - the electron app will not launch flask. This is deliberate due to our custom environment variable `ELECTRON_FLASK_DONT_LAUNCH_FLASK` set to `"1"` and the electron main process `index.js` looking for this environment variable. The reasoning for not launching flask automatically when debugging electron is:
- The electron launcher via `launch.json` cannot activate the correct python virtual environment before launching electron, so running the flask process is going to fail anyway. 
  - There may be a way around this via extr entries in the above `launch.json` but these have not yet been discovered?  
  - Incidentally launching the correct python virtual environment shell for the electron process isn't a problem in the `bin/runelectron` script because it does `source venv/bin/activate && npm start` which does indeed launch the correct venv, so that when electron calls the shell to launch flask, the venv is the correct one.
- You are trying to debug electron so you probably want to launch flask in a debugging mode too, in which case you are probably going to launching flask separately anyway, using a vscode launch config (see next section for info on this).
- You can easily launch flask separately on the command line with `runflask`

## Notes

P.S. If you *really* want to auto launch flask from electron when launching electron in debugging mode, you could potentially build and then launch the flask executable from electron instead of launching the flask python file. This would run with its own Python environment and thus run correctly. To do this you would need built a flask executable using the script `buildflask-exe` then copy the resulting `dist/app` into `node_modules/electron/dist/Electron.app/Contents/Resources/app/dist/app` so that the the `guessPackaged()` function in `src/index.js` gets fooled into thinking we are running in packaged mode. Remember to delete the `app` from that location afterwards.
