# Events

# Events

You can communicate between any of these
- a flask page (flask page in render process's iframe)
- the electron render process html page 
- the electron main process

A flask page actually lives inside an iframe of the render process.

## Flask -> Render -> Main

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

### Optional Render -> Main

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

## Main -> Flask

Intercepting events from the main process is important because e.g. native Electron menu items trigger events in the main process.

![demo](/generators/app/templates/src-flask-server/static/images/events-main-process-to-flask.svg)

We should use standard Electron inter-process communication techniques to send a message from the main -> render process, if we need to.

There are various scenarios:
- The Electron main process javascript calls a flask endpoint using ajax and receives a result, which can then be relayed to the render process.
- The Electron render process javascript calls a flask endpoint.
- The Electron render process javascript can load any flask page into the iframe. It can also load in any arbitrary html into the iframe.
- The flask page can call a flask endpoint using ajax and update its own DOM if necessary.

### Example 1

A challenging and interesting scenario might be - an electron menu item which causes the state of a flask page to change.

Simply send an event `main -> render`, then from the render process send a custom event to the iframe like this:

```javascript
let event = new CustomEvent('eventFromRenderProcess', { detail: { foo: 'bar2' } })
document.querySelector('iframe.flask-pages').contentDocument.dispatchEvent(event)
```

and receive it in the flask javascript like this

```javascript
// Example of listening for events from render process html
window.document.addEventListener('eventFromRenderProcess', handleEvent, false)
function handleEvent(e) {
    console.log(e.detail)
    alert('iframe FLASK page received event from electron render process')
}
```

## Flask server -> Electron?

Whilst anyone (electron render process, electron main process, flask rendered page) can talk to the flask server just by calling an endpoint, can the flask server talk to any of these electron processes? 

No, it can only reply to incoming requests - unless perhaps you set up a socket or other such two way mechanism - yet to be explored. Its probably out of scope of this project since its just regular client server programming - the world is your oyster in terms of what you want to do.
