import React from 'react'
import { useSelector } from 'react-redux'
import PromptArchive from './PromptArchive'
import Tweet from './Tweet'
import './App.css'

function Session(props) {
  const session = useSelector((state) => state.session)

  const tweets = session.tweet.slice(0, 100)

  console.log(session.account)
  return (
    <div>
      <h2>{session.account.username}</h2>
      {tweets.map((tweet, index) => <Tweet key={index} data={tweet} />)}
    </div>
  )
}

export default function App(props) {
  const haveSession = useSelector((state) => state.session != null)

  return (
    <div className="App">
      {haveSession ? <Session /> : <PromptArchive />}
    </div>
  )
}
