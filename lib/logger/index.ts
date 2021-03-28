//const { createLogger, format, transports } = require('winston');
import * as winston from 'winston'
 

export function createCustomLogger(_winston:any = winston) {

  const { combine, splat, timestamp, printf } = _winston.format;

  const myFormat = printf( ({ level, message, timestamp , ...metadata}) => {
    let msg = `${timestamp} [${level}] : ${message} `  
    if(metadata) {
      msg += JSON.stringify(metadata)
    }
    return msg
  });

  const logger = _winston.createLogger({
    level: 'debug',
    format: combine(
      _winston.format.colorize(),
      splat(),
      timestamp(),

      myFormat
    ),
    transports: [
      new _winston.transports.Console({ level: 'info' }),
      new _winston.transports.File({ filename: './logs.log', level: 'debug' }),
    ]
  });
    return logger
}
 