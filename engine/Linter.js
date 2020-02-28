class Linter {
  constructor (options) {
    this._options = options || {}
    this._linter = null
    this._error = null
  }

  get isValid () {
    return this._error === null
  }

  get error () {
    return this._error
  }

  initEslinter () {
    try {
      const { destination, rc } = this._options
      const CLIEngine = require("eslint").CLIEngine;
      this._linter = new CLIEngine({ configFile: rc, fix: true })
    } catch (e) {
      this._error = e
    }
  }

  initJsBueatifier () {

  }

  lint () {
    const { destination } = this._options
    // lint
    const report = this._linter.executeOnFiles([destination]);

    // output fixes to disk
    this._linter.outputFixes(report);
  }
}

module.exports = Linter
