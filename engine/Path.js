const _ = require('lodash')
const path = require('path')
const Parameter = require('./Parameter.js')
const { renderTemplateToFile } = require('./helpers')

class BasePath {
  constructor (options) {
    this._options = Object.assign({}, options)
  }

  getProperty (key, def = undefined) {
    return _.get(this, ['_options', key], def)
  }

  setProperty (key, value) {
    this._options[key] = value
    return this
  }

  get options () {
    return this._options
  }
}

class Path extends BasePath {
  constructor (options) {
    super(options)
  }

  get path () {
    return this.getProperty('path', '')
  }

  get operationId () {
    return this.getProperty('operationId', '')
  }

  get parameters () {
    return this.getProperty('parameters', []).map(options => new Parameter(options))
  }

  get methodName () {
    return _.camelCase(this.getProperty('operationId', ''))
  }

  get method () {
    return this.getProperty('method', false)
  }

  static extract (properties, method, path, json) {
    // check if we have any $refs convert them to real values
    const ref = _.get(properties, ['requestBody', 'content', 'application/json', 'schema', '$ref'])
    if (ref) {
      const schemaPath = ref.replace('#', '').replace('/', '').replace(/\//gmi, '.')
      const schema = _.get(json, schemaPath, false)
      if (!schema) {
        throw new Error(`Schema $ref ${ref} not found in schemas`)
      }
      _.set(properties, ['requestBody', 'content', 'application/json', 'schema'], schema)

      return new Path({ ...properties, method, path })
    }

    return new Path({ ...properties, method, path })
  }

  /**
   * Render path to source code
   *
   * @param engine {Engine}
   * @return Promise
   */
  async renderToFile (engine) {
    const template = path.join(__dirname,engine.language, engine.client, 'method.twig')
    const file = path.join(engine.destination, `${this.operationId}.js`)

    const options = { ...this.options, parameters: this.parameters }
    return await renderTemplateToFile(template, file, this)
  }
}

module.exports = Path
