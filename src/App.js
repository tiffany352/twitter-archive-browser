import React from 'react'
import './App.css'
const electron = window.require('electron')
const { dialog } = electron.remote
const fs = electron.remote.require('fs')

function parseGarbageFile(data) {
  const string = new TextDecoder('utf-8').decode(data)

  const pattern = /^[^=]+ = (.*)$/ms
  const rest = pattern.exec(string)[1]
  const decoded = JSON.parse(rest)

  return decoded
}

function openFile() {
  dialog.showOpenDialog({
    properties: ['openFile', 'openDirectory'],
  }, (path) => {
    console.log("archive opened", path)
    const file = path + "/profile.js"

    fs.readFile(file, (err, rawData) => {
      if (err) throw err

      const data = parseGarbageFile(rawData)
      console.log("data", data)
    })
  })
}

export default function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Drag your archive zip or folder here to open it.
        </p>
        <hr />
        <p>
          Or, you can <button onClick={openFile}>open a file</button>
        </p>
      </header>
    </div>
  )
}
