const projects = [/*'packages/jsonspec',*/ 'packages/babel-plugin-jsonspec']

const config = {
  moduleFileExtensions: ['js', 'ts'],
  coveragePathIgnorePatterns: ['/node_modules/', 'test/'],
  testPathIgnorePatterns: ['blueprint-templates'],
  testRegex: '\\.spec\\.ts$',
  transform: {
    '^.+\\.[t|j]s$': process.env.ci ? 'ts-jest' : '@swc/jest'
  }
}

module.exports = {
  coverageDirectory: 'coverage',
  collectCoverage: true,
  testEnvironment: 'node',
  projects: projects.map((dir) => ({
    displayName: dir,
    rootDir: dir,
    ...config
  }))
}
