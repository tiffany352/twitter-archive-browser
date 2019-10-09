import React from 'react'
import ReactDOM from 'react-dom'
import { useSelector } from 'react-redux'
import PromptArchive from './PromptArchive'
import Session from './Session'
import './App.css'

function AppTitle(props) {
  const accountName = useSelector((state) => state.session != null && state.session.account.username)

  const title = (
    <title>
      {accountName ? `${accountName} - Twitter Archive Browser` : `Twitter Archive Browser`}
    </title>
  )
  
  return ReactDOM.createPortal(title, document.head)
}

export default function App(props) {
  const haveSession = useSelector((state) => state.session != null)

  return (
    <div className="App">
      {haveSession ? <Session /> : <PromptArchive />}
      <AppTitle />
    </div>
  )
}
