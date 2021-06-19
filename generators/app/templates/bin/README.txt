Put this directory in your PATH

### Mac, Linux

Edit your `~/.bashrc` and add:

    export PATH="./bin:$PATH"

then start a fresh shell.

### Windows 10

Add `bin` to your 'Environment Variables / User variables for USER / Path' using the built in editor, which you can find by typing 'path' into the windows search bar and selecting 'Edit the system environment variables' menu item.

> Ensure you close all running terminals and shells and open a fresh terminal. In 'Command Prompt' shell type `PATH` and ensure the relative path to bin has been added ok e.g. Notice the last entry below:

    ...;bin;

