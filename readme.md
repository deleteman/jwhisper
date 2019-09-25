

# jWhiper

Welcome to jWhiper's readme page. What's jWhisper? It is an [JSON-WSP](https://en.wikipedia.org/wiki/JSON-WSP) compatible library. In other words, this is an RPC (Remote Procedure Call) library that allows you to interact with remote code just as it if was local (almost).

Where the heck does the name come from? I know, it's a strange one, I was trying to come up with a cool name ([I really tried](https://twitter.com/deleteman123/status/1175421900538953728)), but all I got was this silly word (which comes from **j**SON-**W**hi**sp**er #seeWhatIDidthere?).

## How to use it?

This library allows you to both, setup a server and share content through JSW-WSP with it, or write a client that interacts with that content.

### Writing a server

Server wise, you need to setup your schema which will be transfered back to the clients once they're instantiated, or it'll receive the requests (through an HTTP POST connection) and execute the intended method.

Here is a code sample:

```js
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
```

This server shared only the `add` method, no the `mult` one from the `Test` class.

### Writing a client

The client is super easy to create, simply instantiate it and configure it to point to the right address.

Here is a simple code sample>

```js

const Client = require("./lib/client")


let myClient = new Client({
    host: "http://localhost",
    port: 8080
})

myClient.on('ready', _ => {
    console.log("Connection stablished, schema received");

    (async () => {
        console.log("Remotely adding numbers...")
        let result = null
        try{
            result = await myClient.add(2,3)
        } catch(e) {
            console.log("Error trying to call remote method: ", e)
        }
        console.log("Result: ", result)
    })()


});
```

That's a lot of code, but notice how we're using the `add` method just as if it was local (with the added / required async part).

## License
I wrote this in a night as part of an experiment for an article I was writing, so feel free to use it as you see fit. If you happen to find bugs and would love to send fixes over, open a PR, I'll love to take a look!