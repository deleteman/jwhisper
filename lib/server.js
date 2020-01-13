const http = require("http")
const EE = require("events")
const logger = require("./logger")
const config = require("config")

class Service {

    constructor(name, meta) {
        this.class = meta.service_class
        this.methods = meta.methods
        this.name = name
        this.params = meta.params
    }

    subscribeToMethods(emitter) {
        let methodNames = Object.keys(this.methods)

        let instance = new (this.class)()

        methodNames.forEach( m => {
            let eventKey = this.name + "_" + m
            logger.info("Subscribing to %s", eventKey)
            emitter.on(eventKey, ({res, ...args}) => { //function to execute once the client sends the request
                let params = Object.keys(this.methods[m].params)
                let paramValues = params.map( p => args[p])

                //execute method
                let result = instance[m].apply(instance, paramValues)

                let jsonRes = {
                    "res": {
                        "type": this.methods[m].ret_info.type,
                        "value": result
                    }
                }
                res.setHeader("content-type", "application/json")
                res.end(JSON.stringify(jsonRes))
            })
        })
    }
}


module.exports = class Server extends EE{

    constructor(conf) {
        super()
        this.specs = conf.specs
        this.specs.type = config.get("wsp.type") 
        this.specs.version = config.get("wsp.version") 

        this.services = conf.services;
        this.types = conf.types

        

    }

    setupServices() {
        let serviceKeys = Object.keys(this.services)

        serviceKeys.forEach( k => {
            let service = new Service(k, this.services[k])
            service.subscribeToMethods(this)
        })
    }

    start(port, host) {
       this.server = http.createServer(this.parseMsg.bind(this));
       this.server.listen(port, () => {
        this.setupServices()
        logger.info(`Server started at ${host}:${port}`);
       });
    }

    unmarshall(rawData) {
        let u = null
        logger.info("Unmarshalling message...")
        u = JSON.parse(rawData)

        logger.debug(u)

        let required = ['args', 'methodname', 'name']

        let missingParams = required.filter( p => !u[p] )

        logger.info("Missing properties: ", missingParams)

        if(missingParams.length > 0) {
            throw new Error("Missing '" + missingParams.join("','") + "' from the properties of the message")
        }

        return u
    }

    rootEndpoint(res) {
        res.setHeader('content-type', 'application/json')
        let sName = Object.keys(this.services)[0]
        let responseJSON = {
            type: this.specs.type,
            version: this.specs.version,
            types: this.types,
            serviceName: sName,
            methods: this.services[sName].methods
        }
        res.end(JSON.stringify(responseJSON))
    }

    parseMsg(req, res) {
        const { method, url } = req;
        logger.debug("Parsing message...")
        logger.debug(method, typeof method)
        logger.debug(url)

        if(method.toUpperCase() != "POST") {
            res.statusCode = 400
            res.end("Invalid method")
            return false
        }

        if(url.toLowerCase() == config.get("wsp.message_endpoint")) {
            let buffer = []
            req.on('data', chunk => {
                buffer.push(chunk)
            }).on('end', _ => {
                buffer = Buffer.concat(buffer).toString()
                let unmarshalled = null
                try { 
                    unmarshalled = this.unmarshall(buffer)
                } catch (e) {
                    res.statusCode = 500
                    return res.end("Error unmarshalling message: " + e)
                }

                let eventKey = unmarshalled.name + "_" + unmarshalled.methodname
                logger.info("Emitting event: %s", eventKey)
                this.emit(eventKey, {res, ...unmarshalled.args})
            })
        } else { 
            return this.rootEndpoint(res)
        }
    }
}
