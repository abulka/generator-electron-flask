// ** this js file is not included by hello.html
// it is here as an example

// export function blah() { return 'blah blah' }
// export let xx = 100;

export const HelloVueApp = {
    data() {
        return {
            // message: 'Hello Vue!!',
            // iframe22: 'hit the button',
            // debug1: false
        }
    },
    methods: {
        // getInfo() {
        //     $.ajax({
        //         method: "GET",
        //         url: `http://localhost:<%= portFlask %>`,
        //         data: {},
        //         // contentType: "application/json",
        //         success: response => {
        //             this.message = response
        //         }
        //     });
        // },
        // getInfo2() {
        //     $.ajax({
        //         method: "POST",
        //         url: `http://localhost:<%= portFlask %>/info2`,
        //         data: { debug1: this.debug1 },
        //         // contentType: "application/json",
        //         success: response => {
        //             let iframe = document.querySelector('#iframe22')
        //             iframe.srcdoc = `<pre>${response}</pre>`
        //         }
        //     });
        // }
    },
    // watch: {
    //     debug1: (oldVal, newVal) => {
    //         //do something when the data changes.
    //         if (val) {
    //             // this.makeSmthWhenDataChanged();
    //             console.log('debug1 change', oldVal, newVal)//, this.debug1)
    //         }
    //     }
    // },    
    delimiters: ["${", "}"]
}
