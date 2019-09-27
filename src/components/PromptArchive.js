import React from 'react'
import { useDispatch } from "react-redux"
import parseArchive from '../parseArchive'
const electron = window.require('electron')
const { dialog } = electron.remote

export default function PromptArchive(props) {
  const dispatch = useDispatch()

  const openFile = () => {
    dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory'],
    }, async (path) => {
      console.log("archive opened", path)
      const archive = await parseArchive(path)
      console.log(archive)
      dispatch({
        type: 'sessionCreate',
        archive
      })
    })
  
  }

  return (
    <header className="App-header">
      <p>
        Drag your archive zip or folder here to open it.
      </p>
      <hr />
      <p>
        Or, you can <button onClick={openFile}>open a file</button>
      </p>
    </header>
  )
}
