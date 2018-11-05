const path = require('path')
const util = require('util')
const events = require('events')
const archiver = require('archiver')

const handleResult = cb => result => {
  if (result.status !== 0) throw new Error(result.value.message)
  cb(result.value)
}

function uploadLocalFile () { events.EventEmitter.call(this) }
util.inherits(uploadLocalFile, events.EventEmitter)

/**
 * uploadLocalFile is responsible for using webdriver protocol to upload a local
 * file to a remote Selenium server for use in testing uploads.
 *
 * @argument filePath Local path to the file used for uploading
 * @argument inputSelector Input selector for the file input to upload with
 */
uploadLocalFile.prototype.command = function uploadLocalFile (inputSelector, filePath) {
  const self = this
  const Nightwatch = this.client
  const api = this.api

  if (
    Nightwatch.options.selenium_host &&
    (
      Nightwatch.options.selenium_host === '127.0.0.1' ||
      Nightwatch.options.selenium_host === 'localhost'
    )
  ) {
    api.setValue(inputSelector, filePath, () => self.emit('complete'))
  }
  else {
    const uploadRemote = cb => {
      let buffers = []
      let zip = archiver('zip')
      zip
      .on('data', data => { buffers.push(data) })
      .on('error', err => { throw err })
      .on('finish', () => {
        const file = Buffer.concat(buffers).toString('base64')
        api.session(session => {
          const opt = {
            path: `/session/${session.sessionId}/file`,
            method: 'POST',
            data: { file }
          }
          Nightwatch.runProtocolAction(opt, handleResult(cb)).send()
        })
      })

      const name = path.basename(filePath)
      zip.file(filePath, { name })
      zip.finalize()
    }

    uploadRemote(tempUrl => {
      api.setValue(inputSelector, tempUrl, () => self.emit('complete'))
    })

  }

  return self
}

module.exports = uploadLocalFile
