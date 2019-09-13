/**
 * Parse extract all information from swagger file
 */
class Engine {
  /**
   *
   * @param file     {String}  File path in local file system
   * @param language {String}  For which language to generate (es, ts)
   * @param client   {String}  Which http client backend will be used (axios, fetch, superagent)
   */
  constructor ({ file, language = 'es', client = 'axios' }) {
    this._file = file
    this._language = language
    this._client = client
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
}

module.exports = Engine
