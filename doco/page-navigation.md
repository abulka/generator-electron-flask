# Page navigation

As mentioned, it is recommended that flask rendered pages are loaded in an iframe of the render process browser window. If they are loaded in the main render process browser window, you lose electron interprocess communication.

## Why loading flask pages into electron browser window is a bad idea

Links to flask rendered pages in the renderer process html e.g. if
`src/index.html` contained
    
    <a href="http://localhost:5000/hello">hello</a>

is bad because whilst it works, you navigate away from the render process html
page and can never navigate back. This means you lose the ability to talk to the
render process from flask pages - which is a useful thing to be able to do. You
also give up the ability to talk to the electron main process via the render
process html page.

# Recommended approach to flask based page navigation
The solution is to load flask pages into an iframe instead. This way the render
process html always exists. Flask pages can then communicate with the render
process html `src/index.html` using custom events (note event bubbling won't
work because it stops at document boundaries). Also flask html pages can
communicate with the main process `src/index.js` via the render
process html using standard electron communication techniques.

And of course all of the following can communicate with the flask server:
- the electron render process html `src/index.html`
- the election main process `src/index.js`
- flask rendered pages

## P.S. on page navigation

Note that Electron restarts the renderer process when a new URL is loaded, so you'll probably see a flash when that happens. This is why it's usually best to use a single page application (SPA) architecture when building Electron apps.  https://stackoverflow.com/questions/39880979/electron-how-to-load-a-html-file-into-the-current-window

Note that the iframe based solution is a kind of combination SPA (in the sense that the renderer process html stays around and is the `S` in SPA) and has the multiple flask pages _via the iframe_.

# Setting the initial flask page

The initial page displayed in the iframe comes from the flask server and the url is prompted for when running this generator.

For example, if you want the initial page to be `/hello` then type in `hello` when prompted. Ensure you have a flask server endpoint that responds to this route.  E.g. in `src-flask-server/app.py` ensure you have something like:

```python
@app.route('/hello')
def hello():
    return render_template('hello.html', msg="YOU")
```

> Note: the above route is auto created by the project.
