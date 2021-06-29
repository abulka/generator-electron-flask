# Events

You can communicate between any of these
- a `flask page` (flask page in render process's iframe)
- the `flask server`
- the electron `render` process html page 
- the electron `main` process

A flask page actually lives inside an iframe of the render process.

There are various scenarios for communication:
- The Electron main process javascript calls a flask endpoint using ajax and receives a result, which can then be relayed to the render process.
- The Electron render process javascript calls a flask endpoint.
- The Electron render process javascript can load any flask page into the iframe. It can also load in any arbitrary html into the iframe.
- The flask page can call a flask endpoint using ajax and update its own DOM if necessary.
- etc

Let's cover the main cases.

# → Flask Server

## Flask Page → Flask Server

Just use ajax.

## Render → Flask Server

Just use ajax.

## Main → Flask Server

Just use javascript e.g. the nodejs request library.

# Flask Page → Main

This needs to be done in two steps:

## Step 1. Flask Page → Render

The way to communicate between electron processes is documented by the [Electron documentation](https://www.electronjs.org/docs/api/ipc-main) and tutorials like [this](https://www.tutorialspoint.com/electron/electron_inter_process_communication.htm).

The only trick that electron-flask needs to achieve is to communicate from the flask page living in the iframe to the parent render process page.

Simply send a custom event from the iframe's flask rendered HTML to the outer render process HTML `window.parent.document` (or to `window.top.document`) like this:

```html
<li><a href="javascript:window.parent.document.dispatchEvent(new CustomEvent('eventFromIframePage', { detail: { foo: 'bar' } }));">Send custom event to window.parent (render process)</a></li>
```

and receive it in the render process like this:

```javascript
// In electron render process html, listen for possible custom events from iframe pages
// You could in turn talk to the electron main process from here, thus offering a way for
// flask pages to talk to both the render process and the main process.
window.document.addEventListener('eventFromIframePage', handleEvent, false)
function handleEvent(e) {
    console.log(e.detail)
    alert('electron render process html received event from iframe page.')
}
```

> The demo page `/hello-vue`, in the generated project, demonstrates this communication.

## Step 2. Render → Main

Once the event reaches the render process, you can then contact the main electron process (`src/index.js` using the official Electron inter-process techniques, viz. sending a second event and possibly passing the payload of the first event onto the second event.

```javascript
// flask page in render process iframe -> render process -> main process
window.document.addEventListener('eventFromIframePageToMain', handleEventAndPassItOn, false)
function handleEventAndPassItOn(e) {
    console.log(window.ipcRenderer.sendSync('synchronous-message', e.detail)) 
}
```

- stage 1 receive event from flask page in iframe
- stage 2 send second event to main process, passing on the payload

> Tip: Look in the terminal console for proof that the main process got the event and its payload

Of course you can do electron inter-process communication using [asynchronous events](https://www.tutorialspoint.com/electron/electron_inter_process_communication.htm), too.

# Main → Flask Page

Intercepting events from the main process is important because e.g. native Electron menu items trigger events in the `main` process.  How do we send this event to the flask page and perhaps cause the state of a flask page to change?

This needs to be done in two steps:

![demo](/generators/app/templates/src-flask-server/static/images/events-main-process-to-flask.svg)

## Step 1: Main → Render

Use standard Electron inter-process communication techniques to send a message from the main -> render process. In the main electron process `src/index.js`

```javascript
mainWindow.webContents.send('eventFromMainProcessToPassOnToIframe', 
                            {detail: { foo: 'bar3', time: (new Date()).getTime() }}) 
```

The second parameter to `send`, the event payload object, is entirely up to the developer to design.

Receive this event in the render process `src/index.html` like this:

```javascript
window.ipcRenderer.on('eventFromMainProcessToPassOnToIframe', function(event, arg) {
    // stage 1 receive from main process
    // stage 2 send down to iframe for flask page to possibly pick up
    let event2 = new CustomEvent('eventFromRenderProcess', arg)
    document.querySelector('iframe.flask-pages').contentDocument.dispatchEvent(event2)
});
```

Notice we pass the pass the payload `arg` to the next event, which is sent to the iframe / flask page.

## Step 2: Render → Flask page

From the render process send a custom event to the iframe like this:

```javascript
let event = new CustomEvent('eventFromRenderProcess', { detail: { foo: 'bar2' } })
document.querySelector('iframe.flask-pages').contentDocument.dispatchEvent(event)
```

> If you are reading this as part of the Main → Render flow, be aware that the above `dispatchEvent` has already been done in step 1, passing the event payload sent from the main process.

and receive it in the flask page javascript like this

```javascript
// Example of listening for events from render process html
window.document.addEventListener('eventFromRenderProcess', handleEvent, false)
function handleEvent(e) {
    console.log(e.detail)
    alert('iframe FLASK page received event from electron render process')
}
```

The payload is in `e.detail`.

# Addendum

## Flask server → Electron?

Whilst anyone (electron render process, electron main process, flask rendered page) can talk to the flask server just by calling an endpoint, can the flask server talk to any of these electron processes? 

No, the flask server can only reply to incoming requests - unless perhaps you set up a socket or other such two way mechanism - yet to be explored. Its probably out of scope of this project since its just regular client server programming - the world is your oyster in terms of what you want to do.
