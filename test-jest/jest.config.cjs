// jest.config.cjs
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
   verbose: true,
   testEnvironment: 'jsdom',
   transform: {
     '^.+\\.tsx?$': ['ts-jest', {
       useESM: true,
     }],
   },
   moduleNameMapper: {
     '^(\\.{1,2}/.*)\\.js$': '$1',
   },
   extensionsToTreatAsEsm: ['.ts'],
};

module.exports = config;
