import React from 'react'
import { useSelector } from 'react-redux'
import Tweet from './Tweet'
import './Session.css'

export default function Session(props) {
  const session = useSelector((state) => state.session)

  const tweets = session.tweet.slice(0, 100)

  console.log(session.account)
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
        <input type="search" className="Session-header-item" placeholder="Search" />
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
