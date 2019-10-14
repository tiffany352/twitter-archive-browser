import React, { useState, useContext } from 'react'
import InfiniteScroll from 'react-infinite-scroller'
import Tweet from './Tweet'
import SessionContext from './SessionContext'
import useQuery from '../useQuery'
import MediaViewer from './MediaViewer'
import './TweetsPage.css'

export default function TweetsPage(props) {
  const [count, setCount] = useState(30)
  const { session } = useContext(SessionContext)
  const query = useQuery()

  const tweets = []
  const search = query.get('search')
  const needle = search && search.toLowerCase()
  let hasMore = false

  const oldest = new Date(session.account.createdDate)
  let newest = new Date()
  if (session.tweet.length > 0) {
    newest = session.tweet[0].created_date
  }
  const tweetsPerDay = new Map()
  for (const tweet of session.tweet) {
    const date = tweet.created_date
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    tweetsPerDay.set(key, (tweetsPerDay.get(key) || 0) + 1)
  }
  oldest.setDate(oldest.getDate() - oldest.getDay())

  const tweetsPerWeek = []
  for (const date = new Date(oldest); date <= newest; date.setDate(date.getDate() + 7)) {
    let sum = 0
    for (let i = 0; i < 7; i++) {
      const weekDay = new Date(date)
      weekDay.setDate(weekDay.getDate() + i)
      sum += tweetsPerDay.get(`${weekDay.getFullYear()}-${weekDay.getMonth()}-${weekDay.getDate()}`) || 0
    }
    tweetsPerWeek.push({
      count: sum,
      date: new Date(date),
    })
  }
  tweetsPerWeek.reverse()
  const maxCount = tweetsPerWeek.reduce((acc, { count }) => Math.max(acc, count), 0)

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
        {tweetsPerWeek.map(({ count, date }, index, array) => {
          const showYear = index === 0 || (
            date.getFullYear() !== array[index - 1].date.getFullYear()
          )
          const options = {
            month: 'short',
            day: 'numeric',
          }
          const startDate = date.toLocaleDateString(undefined, options)
          const endOfWeek = new Date(date)
          endOfWeek.setDate(endOfWeek.getDate() + 6)
          const endDate = endOfWeek.toLocaleDateString(undefined, options)
          return (
            <React.Fragment key={index}>
              {showYear && (
                <h3>{date.getFullYear()}</h3>
              )}
              <div
                className="TweetsPage-week"
                data-date={`${startDate} - ${endDate} (${count} tweets)`}
              >
                <div
                  className="TweetsPage-weekCount"
                  style={{ width: `${count / maxCount * 98 + 2}%` }}
                />
              </div>
            </React.Fragment>
          )
        })}
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