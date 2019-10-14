import React, { useState, useContext } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import Tweet from './Tweet'
import SessionContext from './SessionContext'
import useQuery from '../useQuery'
import MediaViewer from './MediaViewer'

export default function TweetsPage(props) {
  const [count, setCount] = useState(30)
  const { session } = useContext(SessionContext)
  const query = useQuery()

  const tweets = []
  const search = query.get('search')
  const needle = search && search.toLowerCase()
  let hasMore = false

  for (const tweet of session.tweet) {
    if (props.includeReplies || !tweet.in_reply_to_user_id_str) {
      if (!needle || tweet.full_text.toLowerCase().includes(needle)) {
        tweets.push(tweet)
      }
    }
    if (tweets.length >= count) {
      hasMore = true
      break
    }
  }

  const loadMore = () => {
    setCount(count + 20)
  }

  return (
    <>
      <aside className="Session-sidebar">
        2019
        2018
        2017
        2016
        2015
      </aside>
      <MediaViewer />
      <article className="Session-content">
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
      </article>
    </>
  )
}