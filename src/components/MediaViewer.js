import React, { useState, useContext } from 'react'
import { useHistory } from 'react-router'
import useQuery from '../useQuery'
import SessionContext from './SessionContext'
import './MediaViewer.css'

export default function MediaViewer(props) {
  const [ dataUrl, setDataUrl ] = useState(null)
  const query = useQuery()
  const history = useHistory()
  const { session } = useContext(SessionContext)
  const media = query.get('media')
  const tweetMediaProvider = session.tweet_media
  const messageMediaProvider = session.direct_message_media

  if (!media) {
    return null
  }

  const closeMedia = () => {
    query.delete('media')
    setDataUrl(null)
    history.replace(history.location.pathname + '?' + query.toString())
  }

  if (!dataUrl) {
    const fetch = async () => {
      const tweetUrl = await tweetMediaProvider.fetchMedia(media)
      if (tweetUrl) {
        setDataUrl(tweetUrl)
        return
      }
      const messageUrl = await messageMediaProvider.fetchMedia(media)
      setDataUrl(messageUrl)
    }
    fetch()
  }

  if (!dataUrl) {
    return null
  }

  return (
    <div className="MediaViewer-wrapper" onClick={closeMedia}>
      <div className="MediaViewer-modal">
        <img src={dataUrl} alt="" />
      </div>
    </div>
  )
}
