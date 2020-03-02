const _ = require('lodash')
const { isParameterTypeString, isParameterTypeNumber } = require('./helpers')

/**
 * Parameter class, help render parameters with some additional functionality
 */
class Parameter {
  constructor (options, json) {
    this.options = options

    const ref = _.get(options, '$ref', undefined)
    if (ref !== undefined) {
      this.options = _.get(json, ref.replace('#', '').replace('/', '').replace(/\//gmi, '.'), options)
    }

    const schemaRef = _.get(options, 'schema.$ref', undefined)
    if (schemaRef !== undefined) {
      const schema = _.get(json, schemaRef.replace('#', '').replace('/', '').replace(/\//gmi, '.'), options)
      this.options = { ...options, ...{ schema }}
    }
  }

  get camelCaseName () {
    return _.camelCase(this.name)
  }

  get name () {
    return _.get(this.options, 'name', '')
  }

  get type () {
    const type = _.get(this.options, ['schema', 'type'], '')
    switch (type) {
      case 'integer': return 'Number'
      case 'array': return 'Array'
      case 'string': return 'String'
      default:
        return ''
    }
  }

  get description () {
    return _.get(this.options, 'description', '')
  }

  get isRequired () {
    return _.get(this.options, 'required', false)
  }

  get in () {
    return _.get(this.options, 'in', 'query')
  }

  get isForm () {
    return _.get(this.options, 'style', false) === 'form'
  }

  get hasDefault () {
    return (this.defaultValue !== undefined)
  }

  /**
   * Return source code string, if this parameter has default value described in path,
   * under schema key.
   *
   * @returns {Boolean, String}
   */
  get defaultValue () {
    const type = _.get(this.options, 'schema.type', undefined)

    if (type === undefined) {
      return type
    }

    if (isParameterTypeString(type)) {
      const defaultValue = _.get(this.options, 'schema.default', undefined)
      return defaultValue ? `'${defaultValue}'` : undefined
    } else if (type === 'array') {
      const itemType = _.get(this.options, 'schema.items.type', false)
      const itemDefault = _.get(this.options, 'schema.items.default', undefined)
      if (itemType === false || itemDefault === undefined) {
        return undefined
      }

      if (isParameterTypeString(itemType)) {
        return `['${itemDefault}']`
      } else if (isParameterTypeNumber(itemType)) {
        return `[${itemDefault}]`
      }
    } else if (isParameterTypeNumber(type) && _.get(this.options, 'schema.default', false)) {
      return _.get(this.options, 'schema.default')
    }

    return undefined
  }

  get optionsList () {
    return Object.keys(this.options).map(key => {
      return { key, json: JSON.stringify(this.options[key]) }
    })
  }
}

module.exports = Parameter
