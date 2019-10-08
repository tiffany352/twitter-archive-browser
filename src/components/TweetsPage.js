import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import InfiniteScroll from 'react-infinite-scroller'
import Tweet from './Tweet'

export default function TweetsPage(props) {
  const [count, setCount] = useState(30)
  const session = useSelector((state) => state.session)

  let tweets
  let hasMore = false
  if (session.search) {
    tweets = []
    const needle = session.search.toLowerCase()
    for (let i = 0; i < session.tweet.length; i++) {
      const tweet = session.tweet[i]
      if (tweet.full_text.toLowerCase().includes(needle)) {
        tweets.push(tweet)
      }
      if (tweets.length >= count) {
        hasMore = true
        break
      }
    }
  }
  else {
    tweets = session.tweet.slice(0, count)
    hasMore = count < session.tweet.length
  }

  const loadMore = () => {
    setCount(count + 20)
  }

  return (
    <InfiniteScroll
      pageStart={0}
      loadMore={loadMore}
      hasMore={hasMore}
      loader={<span key="loader">Loading...</span>}
      useWindow={false}
    >
      <div className="Session-contentInner">
        {tweets.map((tweet, index) => <Tweet key={index} data={tweet} />)}
        {tweets.length === 0 && (
          <span className="Session-contentEmpty">
            Nothing here :(
          </span>
        )}
      </div>
    </InfiniteScroll>
  )
}