import React, { useContext } from 'react'
import { Switch, Route, useHistory } from 'react-router'
import TweetsPage from './TweetsPage'
import MessagesPage from './MessagesPage'
import AccountPage from './AccountPage'
import SessionContext from './SessionContext'
import useQuery from '../useQuery'
import './Session.css'

function TweetsAndReplies(props) {
  return <TweetsPage includeReplies />
}

export default function Session(props) {
  const { session } = useContext(SessionContext)
  const history = useHistory()
  const query = useQuery()

  console.log('path', history.location.pathname + history.location.search)

  const handleChange = (event) => {
    const newValue = event.target.value || ''
    if (newValue) {
      query.set('search', newValue)
    }
    else {
      query.delete('search')
    }
    history.replace(history.location.pathname + '?' + query.toString())
  }

  return (
    <div className="Session-container">
      <header className="Session-header">
        <div className="Session-header-item">
          {session.account.username}'s Archive
        </div>
        <button className="Session-header-item" onClick={() => history.push('/archive/account')}>Account</button>
        <button className="Session-header-item" onClick={() => history.push('/archive/tweets')}>Tweets</button>
        <button className="Session-header-item" onClick={() => history.push('/archive/tweetsAndReplies')}>Tweets & Replies</button>
        <button className="Session-header-item" onClick={() => history.push('/archive/messages')}>Messages</button>
        <button className="Session-header-item">Likes</button>
        <div className="Session-header-spacer"></div>
        <input
          type="search"
          className="Session-header-item"
          placeholder="Search"
          value={query.get('search') || ''}
          onChange={handleChange}
        />
      </header>
      <Switch>
        <Route path="/archive/account" component={AccountPage} />
        <Route path="/archive/tweets" component={TweetsPage} />
        <Route path="/archive/tweetsAndReplies" component={TweetsAndReplies} />
        <Route path="/archive/messages" component={MessagesPage} />
      </Switch>
    </div>
  )
}
