import JSZip from 'jszip'
const electron = window.require('electron')
const fs = electron.remote.require('fs').promises

// Abstracts over Node FS API and JSZip API.
export default class FileTree {
  static async open(path) {
    try {
      // It's a zip file
      const handle = await fs.open(path)
      const rawContents = await handle.readFile()
      const zipFile = await JSZip.loadAsync(rawContents)
      return new ZipTree(zipFile)
    }
    catch (e) {
      if (e.code === 'EISDIR') {
        // It's a directory
        return new FsTree(path)
      }
      else {
        // Failure
        throw e
      }
    }
  }

  async readTwitterJson(filename) {
    const buffer = await this.readData(filename)
    if (!buffer) {
      return null
    }
    const string = new TextDecoder('utf-8').decode(buffer)

    const pattern = /^[^=]+ = (.*)$/ms
    const rest = pattern.exec(string)[1]
    const data = JSON.parse(rest)

    return data
  }

  async readBase64(filename) {
    const buffer = await this.readData(filename)
    if (!buffer) {
      return null
    }
    const view = new Uint8Array(buffer)
    const string = view.map((byte) => String.fromCharCode(byte)).join('')
    const contentsBase64 = btoa(string)

    return contentsBase64
  }

  async readZip(filename) {
    const buffer = await this.readData(filename)
    if (!buffer) {
      return null
    }
    const zip = await JSZip.loadAsync(buffer)
    return new ZipTree(zip)
  }
}

export class ZipTree extends FileTree {
  constructor(zip) {
    super()
    this.zip = zip
  }

  type = "Zip"

  async readData(filename, mode) {
    const file = this.zip.file(filename)
    if (!file) {
      return null
    }
    return await file.async(mode || 'arraybuffer')
  }

  async readBase64(filename) {
    const binaryString = await this.readData(filename, 'binarystring')
    if (!binaryString) {
      return null
    }
    const base64 = btoa(binaryString)

    return base64
  }
}

export class FsTree extends FileTree {
  constructor(path) {
    super()
    this.path = path
  }

  type = "Folder"

  async readData(filename) {
    try {
      const file = await fs.open(this.path + '/' + filename)
      return await file.readFile()
    }
    catch (e) {
      if (e.code === 'ENOENT') {
        return null
      }
      throw e
    }
  }
}