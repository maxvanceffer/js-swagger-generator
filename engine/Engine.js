'use strict'

const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const semver = require('semver')
const log = require('./Logger')
const _ = require('lodash')
// const Linter = require('./Linter')
const ApiPath = require('./Path')
const { renderTemplateToFile } = require('./helpers')

/**
 * Parse extract all information from swagger file
 */
class Engine {
  /**
   *
   * @param file           {String}  File path in local file system
   * @param language       {String}  For which language to generate (es, ts)
   * @param client         {String}  Which http client backend will be used (axios, fetch, superagent)
   * @param destination    {String}  Destination folder, where will be put generated source code
   * @param parameters     {Boolean} Render parameters definition for each path ({operationId}_PARAMETERS.js)
   * @param linter         {Object|Boolean}  Linter configuration, leave them false to not perform linting
   */
  constructor ({ file, language = 'es', client = 'axios', destination = '', parameters = false, linter = false }) {
    this._file = file
    this._language = language
    this._client = client
    this._destination = destination
    this._json = null
    this._info = null
    this._servers = null
    this._paths = null
    this._withParameters = parameters
    this._supported = '^3.*.*'
    this._linter = linter ? new Linter(linter) : linter
  }

  get file () {
    return this._file
  }

  set file (value) {
    this._file = value
  }

  get language () {
    return this._language
  }

  set language (value) {
    this._language = value
  }

  get client () {
    return this._client
  }

  set client (value) {
    this._client = value
  }

  get destination () {
    return this._destination
  }

  set destination (value) {
    this._destination = value
  }

  get withParameters () {
    return this._withParameters
  }

  set withParameters (value) {
    this._withParameters = value
  }

  get defaultServerAddress () {
    return _.get(this._servers, [0, 'url'], '')
  }

  async generate () {
    log.info('Start generate')
    return new Promise((resolve, reject) => {
      return this
        .loadAndConvert()
        .then((json) => {
          this._json = json

          this.renderIndexFile()
          this.renderRequestFile()

          if (!Array.isArray(this._paths)) {
            return Promise.reject(new Error('Missing paths in documentation'))
          }

          const paths = this._paths.map(path => path.renderToFile(this))

          return Promise.all(paths)
            .then((results) => {
              resolve(true)
            })
            .catch(e => {
              console.error(e)
              reject(e)
            })
        })
    })
  }

  get imports () {
    if (!Array.isArray(this._paths)) {
      console.error('Missing paths in documentation')
      return []
    }
    return this._paths.reduce((map, path) => map.concat(path.fullImportStatement), [])
  }

  get methods () {
    if (!Array.isArray(this._paths)) {
      console.error('Missing paths in documentation')
      return []
    }
    return this._paths.map(path => path.operationId)
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

  loadAndConvert () {
    return new Promise((resolve, reject) => {
      try {
        const json = yaml.safeLoad(fs.readFileSync(this._file, 'utf8'))
        const { openapi = '0.0.0'} = json
        if (semver.satisfies(openapi, this._supported)) {
          log.info('JSON', json)
          this.extractInfo(json)
          this.extractPaths(json)
          this.extractServers(json)
          resolve(json)
        } else {
          reject(new Error(`Unsatisfied open api version, supported ${this._supported}`))
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  extractInfo (json) {
    const { info = {} } = json
    if (Object.keys(info).length > 0) {
      this._info = info
    }
  }

  extractServers (json) {
    const { servers = [] } = json
    if (servers.length > 0) {
      this._servers = servers
    }
  }

  extractPaths (json) {
    const { paths = {} } = json
    if (Object.keys(paths).length > 0) {
      this._paths = []
      Object.keys(paths).forEach(path => {
        const methods = paths[path]
        Object.keys(methods).forEach(method1 => {
          const object = ApiPath.extract(methods[method1], method1, path, json)
          this._paths.push(object)
        })
      })
    }
  }
}

module.exports = Engine
