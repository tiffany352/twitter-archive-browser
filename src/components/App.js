import React, { useState, useContext } from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter as Router, Switch, Route } from 'react-router'
import PromptArchive from './PromptArchive'
import Session from './Session'
import SessionContext from './SessionContext'
import './App.css'

function AppTitle(props) {
  const { session } = useContext(SessionContext)
  const accountName = session != null && session.account.username

  const title = (
    <title>
      {accountName ? `${accountName} - Twitter Archive Browser` : `Twitter Archive Browser`}
    </title>
  )

  return ReactDOM.createPortal(title, document.head)
}

export default function App(props) {
  const [ session, setSession ] = useState(null)

  return (
    <SessionContext.Provider value={{session, setSession}}>
      <Router initialEntries={["/prompt"]}>
        <div className="App">
          <Switch>
            <Route exact path="/prompt" component={PromptArchive} />
            <Route path="/archive" component={Session} />
          </Switch>
          <AppTitle />
        </div>
      </Router>
    </SessionContext.Provider>
  )
}
