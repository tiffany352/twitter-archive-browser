import React, { useContext } from 'react'
import { Switch, Route, useHistory, useRouteMatch } from 'react-router'
import TweetsPage from './TweetsPage'
import MessagesPage from './MessagesPage'
import SessionContext from './SessionContext'
import './Session.css'

function TweetsAndReplies(props) {
  return <TweetsPage includeReplies />
}

export default function Session(props) {
  const { session } = useContext(SessionContext)
  const history = useHistory()
  const searchMatch = useRouteMatch("*/search/:term")
  const searchTerm = searchMatch && searchMatch.params.term && decodeURIComponent(searchMatch.params.term)

  console.log('path', history.location.pathname)

  const handleChange = (event) => {
    const newValue = event.target.value
    if (!newValue) {
      history.replace('../')
    }
    else if (searchTerm) {
      history.replace(encodeURIComponent(newValue))
    }
    else {
      history.push('search/' + encodeURIComponent(newValue))
    }
  }

  return (
    <div className="Session-container">
      <header className="Session-header">
        <div className="Session-header-item">
          {session.account.username}'s Archive
        </div>
        <button className="Session-header-item" onClick={() => history.push('/archive/tweets/')}>Tweets</button>
        <button className="Session-header-item" onClick={() => history.push('/archive/tweetsAndReplies/')}>Tweets & Replies</button>
        <button className="Session-header-item" onClick={() => history.push('/archive/messages/')}>Messages</button>
        <button className="Session-header-item">Likes</button>
        <div className="Session-header-spacer"></div>
        <input
          type="search"
          className="Session-header-item"
          placeholder="Search"
          value={searchTerm || ''}
          onChange={handleChange}
        />
      </header>
      <Switch>
        <Route path="/archive/tweets/" component={TweetsPage} />
        <Route path="/archive/tweetsAndReplies/" component={TweetsAndReplies} />
        <Route path="/archive/messages/" component={MessagesPage} />
      </Switch>
    </div>
  )
}
