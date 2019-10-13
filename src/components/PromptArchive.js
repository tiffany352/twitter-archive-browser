import React, { useState } from 'react'
import { useDispatch } from "react-redux"
import parseArchive, { ArchiveLoadError } from '../parseArchive'
import './PromptArchive.css'
const electron = window.require('electron')
const { dialog } = electron.remote

export default function PromptArchive(props) {
  const dispatch = useDispatch()
  const [ error, setError ] = useState(null)

  const openFile = async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory'],
    })
    const path = result.filePaths[0]
    console.log("archive opened", path)
    try {
      const archive = await parseArchive(path)
      console.log(archive)
      dispatch({
        type: 'sessionCreate',
        archive
      })
    }
    catch (e) {
      setError(e)
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
          Or, you can <button className="PromptArchive-button" onClick={openFile}>open a file</button>
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
