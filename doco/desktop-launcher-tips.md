# Ubuntu .desktop files for launching apps

Sometimes you cannot launch a file through file manager esp. Nautilus launching electron 4 'shared library' apps and so you have to create a .desktop file

SUMMARY: 
- always put these in  ~/.local/share/applications
- they are for Ubuntu infrastructure to find and add an entry to the GLOBAL menu system
- the exe name must be absolute, quotes are ok "" 

To get the .desktop files to be rescanned, 

    ALT F2

type in the following: 

    restart

its pretty quick and you don't lose any work - all windows and apps stay on the screen.

MY STACKOVERFLOW COMMENT 

> Re the .desktop file approach, for those that don't know: remember to put that file in ~/.local/share/applications for the Gnome desktop to see it, scan it and create a menu/icon entry for your app in the global menu system. Also you probably don't need StartupNotify=true unless your app supports it developer.gnome.org/integration-guide/stable/… – abulka 1 min ago



## technique 1 (recommended)

Pity I can't create a .desktop file that is specific to this app and keep it in the same folder as the linux executable.
Cos that's not how .desktop files work. 

The normal way is to ALWAYS put .desktop files in 

    ~/.local/share/applications
    
so that the Gnome desktop infrastructure scans it and adds an icon to the Gnome desktop menu system - so that when you search for an app or pin it, your app will be listed in the menus, and points to the exe.

    [Desktop Entry]
    Type=Application
    Encoding=UTF-8
    Name=Andy4 Run DIRECT path Executable
    Comment=RunD Executable
    Exec=/home/andy/Desktop/linux-unpacked/electron-actions1
    Terminal=false
