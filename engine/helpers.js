const fs = require('fs')
const twig = require('twig')

/**
 * Parameter types which need to detect as number
 * @type {*[]}
 */
let Numbers = ['integer', 'number']

/**
 * Parameter types which need to detect as string
 * @type {*[]}
 */
let Strings = ['string', 'text']

/**
 * Render twig template to the file, returns promise which will be resolved as soon
 * as file will written.
 *
 * @param template {String} File path to template file
 * @param file     {String} File path in which file to render source code
 * @param options  {Object} Template variables for twig render
 *
 * @return {Promise} Resolve return source code
 */
const renderTemplateToFile = (template, file, options) => {
  return new Promise((resolve, reject) => {
    try {
      twig.renderFile(template, options, (error, sourceCode) => {
        if (error) {
          reject(error)
        }

        return fs.writeFile(file, sourceCode, (error) => {
          if (error) {
            reject(error)
          }
          resolve(sourceCode)
        })
      })
    } catch (e) {
      reject(e)
    }

  })
}

/**
 * Return true if provided type argument should be considered as string type
 *
 * @param type {String}
 * @returns {boolean}
 */
const isParameterTypeString = (type) => {
  return (Strings.indexOf(type) !== -1)
}

/**
 * Return true if provided type argument should be considered as number type
 *
 * @param type {String}
 * @returns {boolean}
 */
const isParameterTypeNumber = (type) => {
  return (Numbers.indexOf(type) !== -1)
}

module.exports = {
  renderTemplateToFile,
  isParameterTypeString,
  isParameterTypeNumber
}
