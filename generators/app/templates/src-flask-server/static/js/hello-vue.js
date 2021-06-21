// This js module is imported into hello-vue.html using ES6 import syntax, and is served via flask

export function blah() { return 'blah blah' }
export let xx = 100;

export const HelloVueApp = {
    data() {
        return {
            message: 'Hello Vue!!',
        }
    },
    methods: {
        getInfo() {
            $.ajax({
                method: "GET",
                url: `http://localhost:<%= portFlask %>`,
                data: {},
                // contentType: "application/json",
                success: response => {
                    this.message = response
                }
            });
        },
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
    delimiters: ["${", "}"]
}
