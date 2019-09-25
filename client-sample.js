
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