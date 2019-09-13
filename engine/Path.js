const _ = require('lodash')

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
  }
}

module.exports = Path
