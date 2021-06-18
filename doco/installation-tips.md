# Install Nodejs nvm on Ubuntu

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

# Install pyenv - for Python

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

## Use it to install python

    pyenv install --list | less
    PYTHON_CONFIGURE_OPTS="--enable-shared" pyenv install 3.9.5
    pyenv global 3.9.5

> Do not simply `pyenv install 3.9.5` as Pyinstaller needs a shared build.
