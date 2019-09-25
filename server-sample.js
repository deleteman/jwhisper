
const Server = require("./lib/server")

class Test {
    constructor() {

    }

    add(a,b) {
        console.log("Adding numbers: ", a, b)
        return a + b
    }

    mult(a,b) {
        return a * b
    }
}

class Users {

    constructor() {
        this.users = []
    }

    addUser(u) {
        this.users.push(u)
        return u
    }
}

let services = {
        "Test": {
            "service_class": Test,
            "methods": {
                "add": {
                    "doc_lines": ["Adds 2 numbers"],
                    "params": {
                        "first_number": {
                            "def_order": 1,
                            "doc_lines": ["first number to add"],
                            "type": "number",
                            "optional": false
                        },
                        "second_number": {
                            "def_order": 2,
                            "doc_lines": ["second number to add"],
                            "type": "number",
                            "optional": false
                        }
                    },
                    "ret_info": {
                        "doc_lines": ["the result of the addition "],
                        "type": ["number"]
                    }
                }
            }
        }
}

let types = {
            "User": {
                "name": "string",
                "age": "number"
            }
        }

const myServer = new Server({
    specs: {
        "servicename": "Test Service",
        "url": ""
    },
    services: services,
    types: types

})

myServer.start(8080, 'http://localhost')
