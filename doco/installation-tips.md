# Installation Tips

These are various installation tips I have gathered in my personal notes, which are worth sharing. 

Andy Bulka, June 2021.

# Mac - Installation of Nodejs and Python

Just use brew for installing pyenv and nvm.

Then use `pyenv` to install Python, 

    PYTHON_CONFIGURE_OPTS="--enable-shared" pyenv install 3.9.5
    pyenv global 3.9.5

then use `nvm` to install node.

    nvm install 12.18.3   don't just say 12 because you will get 12.0.0
    nvm use 12.18.3

# Linux - Installation of Nodejs and Python

## Install Nodejs via nvm on Ubuntu

    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

Which auto adds this to your .bashrc

    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

Restart the terminal - or Restart your shell so the path changes take effect: `exec $SHELL`

    nvm install v12
    npm install -g npm@next

Note that we update npm from older v6 to v7 which has better `npm ls` etc.

Presumably you can install and use an even later version of node and npm than shown here.

## Install pyenv - for Python

pre-requisites:

    sudo apt-get update; sudo apt-get install make build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
    libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

then

    curl https://pyenv.run | bash

Then add

    export PYENV_ROOT="$HOME/.pyenv"
    export PATH="$PYENV_ROOT/bin:$PATH"
    eval "$(pyenv init --path)"

to `~/.profile` which incidentally, is not read for each new shell - only at login, so you need to login to the Linux UI again.

### Use it to install python

    pyenv install --list | less
    PYTHON_CONFIGURE_OPTS="--enable-shared" pyenv install 3.9.5
    pyenv global 3.9.5

> Do not simply `pyenv install 3.9.5` as Pyinstaller needs a shared build.


# Windows 10 - Installation of Nodejs and Python

## install nodejs using nvm

    choco install -y nvm   (y just means no prompts)

- Installer sets up NVM_HOME to point to C:\ProgramData\nvm\ 
- Installers adds NVM_HOME to the PATH
- Restart all shells for this to take into effect. Starting a new shell doesn't work for some reason.

    nvm list
    nvm list available    this literally lists all available versions
    nvm install 12.18.3   don't just say 12 because you will get 12.0.0
    nvm use 12.18.3

node, npm should now work!

### Upgrade npm

    npm install -g npm@next

Fails in windows with Refusing to delete C:\Program Files\nodejs\npm.cmd: is outside C:\Program Files\nodejs\node_modules\npm and not a link. It fails even if you add --force.  But there is a workaround.

Powershell:

    cd $ENV:ProgramData\nvm\v14.17.1   # or whatever version
    mv npm npm-old
    mv npm.cmd npm-old.cmd
    cd node_modules\
    mv npm npm-old
    cd npm-old\bin
    node npm-cli.js i -g npm@latest --force

My [stack overflow comment](https://stackoverflow.com/questions/54652381/updating-npm-when-using-nvm-windows): Those `mv` commands above are for powershell, yet you can't use `%appdata%` syntax in PowerShell so use `$ENV:AppData` in its place. Turned out that my `choco install -y nvm` put nvm in `C:\ProgramData\nvm` so I had to use `cd $ENV:ProgramData\nvm\v14.17.1`. And yes, I had to add the force flag `node npm-cli.js i -g npm@latest --force`.

## Install Python using pyenv in windows 10

https://github.com/abulka/pynsource/issues/68#issuecomment-605612292


