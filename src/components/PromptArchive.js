import React, { useState } from 'react'
import { useDispatch } from "react-redux"
import parseArchive, { ArchiveLoadError } from '../parseArchive'
import './PromptArchive.css'
const electron = window.require('electron')
const { dialog } = electron.remote

export default function PromptArchive(props) {
  const dispatch = useDispatch()
  const [ error, setError ] = useState(null)

  const loadArchive = async (path) => {
    console.log("archive opened", path)
    try {
      const archive = await parseArchive(path)
      dispatch({
        type: 'sessionCreate',
        archive
      })
    }
    catch (e) {
      console.log('parseArchive error', e)
      setError(e)
    }
  }

  const openFileOrFolder = async() => {
    const result = await dialog.showOpenDialog({
      filters: [
        { name: 'Zip Files', extensions: ['zip', 'zipx'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile', 'openDirectory'],
    })
    if (result.filePaths.length > 0) {
      loadArchive(result.filePaths[0])
    }
  }

  const openFile = async () => {
    const result = await dialog.showOpenDialog({
      filters: [
        { name: 'Zip Files', extensions: ['zip', 'zipx'] },
        { name: 'All Files', extensions: ['*'] },
      ],
      properties: ['openFile'],
    })
    if (result.filePaths.length > 0) {
      loadArchive(result.filePaths[0])
    }
  }

  const openFolder = async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })
    if (result.filePaths.length > 0) {
      loadArchive(result.filePaths[0])
    }
  }

  return (
    <div className="PromptArchive-container">
      <div className="PromptArchive-dialog">
        <h2>
          Drag your archive zip or folder here to open it.
        </h2>
        <hr />
        <p>
          <span>You can also </span>
          {(process.platform === 'darwin' && (
            <button className="PromptArchive-button" onClick={openFileOrFolder}>
              browse for a file/folder
            </button>
          )) || (
            <>
              <button className="PromptArchive-button" onClick={openFile}>
                browse for a file
              </button>
              <span> or </span>
              <button className="PromptArchive-button" onClick={openFolder}>
                browse for a folder
              </button>
            </>
          )}
        </p>
        {error instanceof ArchiveLoadError ? (
          <div className="PromptArchive-failReport">
            <h3>
              Loading archive failed: {error.reason}
            </h3>
            <dl>
              <dt>Archive Type</dt>
              <dd>{error.archiveType}</dd>
              <dt>Selected Path</dt>
              <dd><code>{error.path}</code></dd>
              {error.missingFiles && error.missingFiles.length > 0 && (
                <>
                  <dt>Missing Files</dt>
                  <ul>
                    {error.missingFiles.map((file, index) => (
                      <li key={index}><code>{file}</code></li>
                    ))}
                  </ul>
                </>
              )}
            </dl>
          </div>
        ) : error && (
          <div className="PromptArchive-failReport">
            <h3>
              Loading archive failed
            </h3>
            <pre>{error.toString()}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
