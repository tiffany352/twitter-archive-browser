import React from 'react'
import { useSelector } from 'react-redux'
import ExternalLink from './ExternalLink'
import './Tweet.css'

function Media(props) {
  const data = props.data
  if (data.type === 'photo') {
    return (
      <img alt="" src={data.media_url_https} />
    )
  }
  else {
    return (
      <p>Unknown media attachment.</p>
    )
  }
}

export default function Tweet(props) {
  const account = useSelector((state) => state.session.account)

  const data = props.data
  const url = "https://twitter.com/" + account.username + "/status/" + data.id_str
  var media = [];
  if (data.extended_entities) {
    media = data.extended_entities.media.map((media, index) => {
      return <Media data={media} key={index} />;
    });
  }

  const logContents = () => {
    console.log('tweet', data)
  }

  const isRetweet = data.full_text.startsWith('RT ')
  let authorUsername = account.username
  let authorDisplayName = account.accountDisplayName
  if (isRetweet) {
    authorUsername = data.entities.user_mentions[0].screen_name
    authorDisplayName = data.entities.user_mentions[0].name
  }

  return (
    <div className="tweet">
      <span>{authorDisplayName}</span>
      <span>@{authorUsername}</span>
      <p>{data.full_text}</p>
      <div>{media}</div>
      <ExternalLink href={url} className="date">{data.created_at}</ExternalLink>
      <span>rt {data.retweet_count}</span>
      <span>♥{data.favorite_count}</span>
      <button onClick={logContents}>Log Contents</button>
    </div>
  );
}
