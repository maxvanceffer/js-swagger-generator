const { renderTemplateToFile } = require('./helpers')
const fs = require('fs')
const path = require('path')

class Client {
  constructor (engine) {
    this._engine = engine
  }

  /**
   * Return instance of engine
   * @return {Engine|Object}
   */
  get engine () {
    return this._engine
  }

  renderIndexFile () {
    const template = path.join(__dirname, this.language, this.client, 'index.twig')
    const file = path.join(this.destination, 'index.js')

    return renderTemplateToFile(template, file, this)
  }

  renderRequestFile () {
    const template = path.join(__dirname, this.language, this.client, 'request.twig')
    const file = path.join(this.destination, 'request.js')

    return renderTemplateToFile(template, file, this)
  }
}
