export default class GoogleDrive {
  filePresent = async (name) => {
    const response = await this.getFile()
    const matchedFile = response.result.files.find((file) => file.name == name)
    return !!matchedFile
  }

  getFile = () => {
    // eslint-disable-next-line no-undef
    return gapi.client.drive.files.list({
      spaces: 'appDataFolder',
      fields: 'nextPageToken, files(id, name)',
      pageSize: 100,
    })
  }

  createFile = (name, data, callback) => {
    const boundary = '-------314159265358979323846'
    const delimiter = `\r\n--${boundary}\r\n`
    const close_delim = `\r\n--${boundary}--`
    const contentType = 'application/json'

    const metadata = {
      name,
      mimeType: contentType,
      parents: ['appDataFolder'],
    }

    const multipartRequestBody = `${delimiter}Content-Type: application/json\r\n\r\n${JSON.stringify(
      metadata
    )}${delimiter}Content-Type: ${contentType}\r\n\r\n${data}${close_delim}`

    const request = window.gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        'Content-Type': `multipart/related; boundary="${boundary}"`,
      },
      body: multipartRequestBody,
    })
    if (!callback) {
      callback = function (file) {
        console.log(file)
      }
    }
    request.execute(callback)
  }
}
