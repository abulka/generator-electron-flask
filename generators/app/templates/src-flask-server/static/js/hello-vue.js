// This js module is imported into hello-vue.html using ES6 import syntax, and is served via flask

export function blah() { return 'blah blah' }
export let xx = 100;

export const HelloVueApp = {
    data() {
        return {
            message: '',
            messageFromMainProcess: '',
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
        }
    },
    delimiters: ["${", "}"]
}
