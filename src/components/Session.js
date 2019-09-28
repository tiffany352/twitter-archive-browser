import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Tweet from './Tweet'
import './Session.css'

export default function Session(props) {
  const session = useSelector((state) => state.session)
  const dispatch = useDispatch()

  let tweets
  if (session.search) {
    tweets = []
    const needle = session.search.toLowerCase()
    for (let i = 0; i < session.tweet.length; i++) {
      const tweet = session.tweet[i]
      if (tweet.full_text.toLowerCase().includes(needle)) {
        tweets.push(tweet)
      }
      if (tweets.length >= 100) {
        break
      }
    }
  }
  else {
    tweets = session.tweet.slice(0, 100)
  }

  const handleChange = (event) => {
    dispatch({
      type: 'sessionSetSearch',
      search: event.target.value
    })
  }

  return (
    <div className="Session-container">
      <header className="Session-header">
        <div className="Session-header-item">
          {session.account.username}'s Archive
        </div>
        <button className="Session-header-item">Tweets</button>
        <button className="Session-header-item">Messages</button>
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
      <aside className="Session-sidebar">
        2019
        2018
        2017
        2016
        2015
      </aside>
      <article className="Session-content">
        {tweets.map((tweet, index) => <Tweet key={index} data={tweet} />)}
      </article>
    </div>
  )
}
