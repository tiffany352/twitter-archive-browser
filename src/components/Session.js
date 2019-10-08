import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import './Session.css'
import TweetsPage from './TweetsPage'
import MessagesPage from './MessagesPage'

export default function Session(props) {
  const session = useSelector((state) => state.session)
  const dispatch = useDispatch()

  const handleChange = (event) => {
    dispatch({
      type: 'sessionSetSearch',
      search: event.target.value
    })
  }

  const setPage = (page) => {
    dispatch({
      type: 'sessionSetPage',
      page
    })
  }

  return (
    <div className="Session-container">
      <header className="Session-header">
        <div className="Session-header-item">
          {session.account.username}'s Archive
        </div>
        <button className="Session-header-item" onClick={() => setPage('tweets')}>Tweets</button>
        <button className="Session-header-item" onClick={() => setPage('messages')}>Messages</button>
        <button className="Session-header-item">Likes</button>
        <div className="Session-header-spacer"></div>
        <input
          type="search"
          className="Session-header-item"
          placeholder="Search"
          value={session.search || ''}
          onChange={handleChange}
        />
      </header>
      {{
        tweets: () => <TweetsPage />,
        messages: () => <MessagesPage />,
      }[session.page]()}
    </div>
  )
}
