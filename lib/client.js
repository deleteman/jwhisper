const EventEmitter = require("events")
const request = require("request")
const logger = require("./logger")()
const config = require("config")

module.exports = class Client extends EventEmitter{

    constructor(config) {
        super()
        this.host = config.host
        this.port = config.port

        this.getSchema()
    }

    getSchema() {
        let schemaURL = this.host + ":" + this.port
        request.post(
            {url: schemaURL},
            (err, resp) => {
                if(err) {
                    return this.emit("error", err)
                }
                this.parseSchema(JSON.parse(resp.body))
                this.emit('ready')
            }
        )
    }

    sendRequest(reqObj, done) {
        let serviceURL = this.host + ":" + this.port + config.get("wsp.message_endpoint")
        request.post({
            url: serviceURL,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(reqObj)
        }, done)
    }

    parseSchema(schema) {
        logger.info("Parsing schema: ",  schema)
        let methods = Object.keys(schema.methods)

        logger.info("Methods found: %s", methods)
        methods.forEach( m => {
            this[m] = (...args) => {

                let reqObj = {
                    "name": schema.serviceName,
                    "version": config.get('wsp.version'),
                    "type": config.get('wsp.request.type'),
                    "methodname": m,
                    "args": Object.keys(schema.methods[m].params).reduce( (acc, pname, idx) => {
                        acc[pname] = args[idx] 
                        return acc
                    }, {})
                }
                logger.debug("request object: ", reqObj)

                return new Promise( (resolve, reject) => {
                    this.sendRequest(reqObj, (err, resp) => {
                        if(err) return reject(err)

                        let respObj = {}
                        try {
                            respObj = JSON.parse(resp.body)
                        } catch (e) {
                            logger.error("Invalid JSON response format: ", e)
                        }
                        if(!respObj || !respObj.res || !respObj.res.value) {
                            return reject(new Error("Invalid response format"))
                        }
                        let resValue = respObj.res.value
                        resolve(resValue)
                    })
                })
            }

        })
    }
}