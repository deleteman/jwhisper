
const mockedWinston = {
    format: {
        splat: jest.fn(),
      printf: jest.fn(),
      timestamp: jest.fn(),
      simple: jest.fn(),
      colorize: jest.fn(),
      combine: jest.fn()
    },
    transports: {
      Console: jest.fn(),
      File: jest.fn()
    },
    createLogger: jest.fn().mockImplementation(function(creationOpts) {
      return {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };
    })
  };

import { createCustomLogger } from '@deleteman/node-components.logger.logger'

const logger = createCustomLogger(mockedWinston)

describe("Logger module", () => {

    it("should call the createLogger method", () => {

        expect(mockedWinston.createLogger).toHaveBeenCalled()

    })
})