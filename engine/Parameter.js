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

  get hasDefault () {
    return (this.defaultValue !== false)
  }

  /**
   * Return source code string, if this parameter has default value described in path,
   * under schema key.
   *
   * @returns {Boolean, String}
   */
  get defaultValue () {
    const type = _.get(this.options, 'schema.type', false)

    if (type === false) {
      return type
    }

    if (isParameterTypeString(type)) {
      return _.get(this.options, 'schema.type.default', false)
    } else if (type === 'array') {
      const itemType = _.get(this.options, 'schema.items.type', false)
      const itemDefault = _.get(this.options, 'schema.items.default', false)
      if (itemType === false || itemDefault === false) {
        return itemType
      }

      if (isParameterTypeString(itemType)) {
        return `['${itemDefault}']`
      } else if (isParameterTypeNumber(itemType)) {
        return `[${itemDefault}]`
      }
    }

    return false
  }
}

module.exports = Parameter
