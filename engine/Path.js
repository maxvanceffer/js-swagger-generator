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
    return this.getProperty('parameters', []).map(options => new Parameter(options, this.options.json))
  }

  get methodName () {
    return _.camelCase(this.getProperty('operationId', ''))
  }

  get method () {
    return this.getProperty('method', false)
  }

  get importStatement () {
    return `import ${this.operationId} from './${this.operationId}.js'`
  }

  get hasRequestBody () {
    return (this.getProperty('requestBody', false) !== false)
  }

  get bodyPayloadType () {
    if (this.hasRequestBody === true) {
      const requestBody = this.getProperty('requestBody')
      if (requestBody.content) {
        const first = _.first(Object.keys(requestBody.content))
        if (first !== '*/*') {
          return first
        }
      }
      return false
    }
    return false
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

      return new Path({ ...properties, method, path, json })
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
    const file = this.renderMethod(engine)
    if (engine.withParameters) {
      this.renderParameters(engine)
    }
    return file
  }

  renderParameters (engine) {
    const template = path.join(__dirname,engine.language, engine.client, 'parameters.twig')
    const file = path.join(engine.destination, `${this.operationId}_PARAMETERS.js`)
    return renderTemplateToFile(template, file, this)
  }

  renderMethod (engine) {
    const template = path.join(__dirname,engine.language, engine.client, 'method.twig')
    const file = path.join(engine.destination, `${this.operationId}.js`)
    return renderTemplateToFile(template, file, this)
  }
}

module.exports = Path
