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

  get hasPathParameters () {
    return Boolean(this.getProperty('parameters', []).find(option => option.in === 'path'))
  }

  get hasQueryParameters () {
    return Boolean(this.getProperty('parameters', []).find(option => option.in === 'query'))
  }

  get pathParameters () {
    return this.getProperty('parameters', []).filter(option => option.in === 'path')
  }

  get queryParameters () {
    return this.getProperty('parameters', []).filter(option => option.in === 'query')
  }

  get methodName () {
    return _.camelCase(this.getProperty('operationId', ''))
  }

  get method () {
    return this.getProperty('method', false)
  }

  get fullImportStatement () {
    return [
      this.importStatement,
      this.importRawUrlStatement,
      this.importParametersStatement
    ]
  }

  get importStatement () {
    return `import ${this.operationId} from './${this.operationId}.js'`
  }

  get importRawUrlStatement () {
    return `import { ${this.operationId}_URL, ${this.operationId}_RAW_URL } from './${this.operationId}_RAW_URL.js'`
  }

  get importParametersStatement () {
    return `import ${this.operationId}_PARAMETERS from './${this.operationId}_PARAMETERS.js'`
  }

  get hasRequestBody () {
    return (this.getProperty('requestBody', false) !== false)
  }

  get noUselessPayloads () {
    return this.options.uselessPayload
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

    return new Path({ ...properties, method, path, json })
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
    if (engine.withUrls) {
      this.renderUrl(engine)
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
    this.options.uselessPayload = engine.uselessPayload
    return renderTemplateToFile(template, file, this)
  }

  renderUrl (engine) {
    const template = path.join(__dirname, engine.language, engine.client, 'raw_url.twig')
    const file = path.join(engine.destination, `${this.operationId}_RAW_URL.js`)
    return renderTemplateToFile(template, file, this)
  }
}

module.exports = Path
