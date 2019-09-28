import React from 'react'
import { useSelector } from 'react-redux'
import PromptArchive from './PromptArchive'
import Session from './Session'
import './App.css'

export default function App(props) {
  const haveSession = useSelector((state) => state.session != null)

  return (
    <div className="App">
      {haveSession ? <Session /> : <PromptArchive />}
    </div>
  )
}
