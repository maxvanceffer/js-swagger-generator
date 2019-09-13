const yaml = require('js-yaml')
const fs   = require('fs')
const semver = require('semver')
const log = require('./Logger')
const _ = require('lodash')
const twig = require('twig')
const Path = require('./Path')

/**
 * Parse extract all information from swagger file
 */
class Engine {
  /**
   *
   * @param file        {String}  File path in local file system
   * @param language    {String}  For which language to generate (es, ts)
   * @param client      {String}  Which http client backend will be used (axios, fetch, superagent)
   * @param destination {String}  Destination folder, where will be put generated source code
   */
  constructor ({ file, language = 'es', client = 'axios', destination = false }) {
    this._file = file
    this._language = language
    this._client = client
    this._destination = destination
    this._json = null
    this._info = null
    this._servers = null
    this._paths = null
    this._supported = '^3.*.*'
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

  get defaultServerAddress () {
    return _.get(this._servers, [0, 'url'], '')
  }

  generate () {
    log.info('Start generate')
    return new Promise((resolve, reject) => {
      return this
        .loadAndConvert()
        .then((json) => {
          this._json = json
          const { language, client, destination, defaultServerAddress } = this
          const baseTemplate = `${__dirname}/${language}/${client}/base.twig`
          const options = {...this, defaultServerAddress }
          twig.renderFile(baseTemplate, options, (error, html) => {
            if (error) {
              reject(error)
            }

            fs.writeFile(`${destination}/request.js`, html, (error) => {
              if (error) {
                reject('')
              }

              resolve(true)
            })
          })
        })
    })
  }

  renderBase () {

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
          const object = Path.extract(methods[method1], method1, path, json)
          this._paths.push(object)
        })
      })
    }
  }
}

module.exports = Engine
