module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@elevateos/types(.*)$': '<rootDir>/../../../packages/types/src$1',
    '^@elevateos/shared(.*)$': '<rootDir>/../../../packages/shared/src$1',
    '^@elevateos/validation(.*)$': '<rootDir>/../../../packages/validation/src$1',
  },
};

