const _ = require('lodash')
const { isParameterTypeString, isParameterTypeNumber } = require('./helpers')

/**
 * Parameter class, help render parameters with some additional functionality
 */
class Parameter {
  constructor (options) {
    this.options = options
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
      return _.get(this.options, 'schema.default', false)
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
    } else if (isParameterTypeNumber(type)) {
      return _.get(this.options, 'schema.default', 0)
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
