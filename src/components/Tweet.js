import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import ExternalLink from './ExternalLink'
import './Tweet.css'
import Segmenter from '../Segmenter'

function Media(props) {
  const [ mediaUrl, setMediaUrl ] = useState(null)
  const mediaProvider = useSelector((state) => state.session.tweet_media)
  const data = props.data

  if (data.type === 'photo') {
    mediaProvider.getMediaUrl(props.tweetId, data.media_url_https).then((mediaUrl) => {
      setMediaUrl(mediaUrl)
    })

    return (
      <div className="Tweet-media">
        <img alt="" src={mediaUrl} />
      </div>
    )
  }
  else if (data.type === 'video') {
    mediaProvider.getVideoUrl(props.tweetId, data.video_info.variants[3].url).then((mediaUrl) => {
      setMediaUrl(mediaUrl)
    })

    return (
      <div className="Tweet-media">
        <video controls loop src={mediaUrl}>
          Video
        </video>
      </div>
    )
  }
  else if (data.type === 'animated_gif') {
    mediaProvider.getGifUrl(props.tweetId, data.video_info.variants[0].url).then((mediaUrl) => {
      setMediaUrl(mediaUrl)
    })

    return (
      <div className="Tweet-media">
        <div className="Tweet-gifOverlay">
          GIF
        </div>
        <video autoPlay loop src={mediaUrl}>
          Video
        </video>
      </div>
    )
  }
  else {
    return (
      <p>Unknown media attachment.</p>
    )
  }
}

const retweetIcon = (
  <svg viewBox="0 0 24 24" className="Tweet-icon">
    <g>
      <path d="M23.77 15.67c-.292-.293-.767-.293-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z">
      </path>
    </g>
  </svg>
)

const likeIcon = (
  <svg viewBox="0 0 24 24" className="Tweet-icon">
    <g>
      <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12zM7.354 4.225c-2.08 0-3.903 1.988-3.903 4.255 0 5.74 7.034 11.596 8.55 11.658 1.518-.062 8.55-5.917 8.55-11.658 0-2.267-1.823-4.255-3.903-4.255-2.528 0-3.94 2.936-3.952 2.965-.23.562-1.156.562-1.387 0-.014-.03-1.425-2.965-3.954-2.965z">
      </path>
    </g>
  </svg>
)

export default function Tweet(props) {
  const account = useSelector((state) => state.session.account)

  const data = props.data
  const url = "https://twitter.com/" + account.username + "/status/" + data.id_str
  var media = [];
  if (data.extended_entities) {
    media = data.extended_entities.media.map((media, index) => {
      return <Media tweetId={data.id_str} data={media} key={index} />;
    });
  }

  const retweetRegex = /^RT @[^:]*:/
  const retweetMatches = data.full_text.match(retweetRegex)
  const isRetweet = retweetMatches != null
  let authorId = account.accountId
  let authorUsername = account.username
  let authorDisplayName = account.accountDisplayName
  if (isRetweet) {
    authorId = data.entities.user_mentions[0].id_str
    authorUsername = data.entities.user_mentions[0].screen_name
    authorDisplayName = data.entities.user_mentions[0].name
  }

  const segmenter = new Segmenter(data.full_text.length, {
    style: 'normal',
  })

  for (const entity of data.entities.user_mentions) {
    const start = parseInt(entity.indices[0])
    const end = parseInt(entity.indices[1]) - 1
    const url = "https://twitter.com/i/user/" + entity.id_str
    segmenter.setSpan(start, end, {
      style: 'link', 
      display: '@' + entity.screen_name,
      href: url
    })
  }

  // Do after mentions parsing
  if (isRetweet) {
    segmenter.setSpan(0, retweetMatches[0].length, {
      style: 'hide',
    })
  }

  if (data.entities.media) {
    for (const entity of data.entities.media) {
      const start = parseInt(entity.indices[0])
      const end = parseInt(entity.indices[1]) - 1
      segmenter.setSpan(start, end, {
        style: 'hide',
      })
    }
  }

  if (data.entities.urls) {
    for (const entity of data.entities.urls) {
      const start = parseInt(entity.indices[0])
      const end = parseInt(entity.indices[1]) - 1
      segmenter.setSpan(start, end, {
        style: 'link',
        display: entity.display_url,
        href: entity.expanded_url,
      })
    }
  }

  if (data.entities.hashtags) {
    for (const entity of data.entities.hashtags) {
      const start = parseInt(entity.indices[0])
      const end = parseInt(entity.indices[1]) - 1
      segmenter.setSpan(start, end, {
        style: 'link',
        display: '#' + entity.text,
        href: 'https://twitter.com/hashtag/' + entity.text,
      })
    }
  }

  function decodeHTMLEntities(text) {
    var entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['quot', '"']
    ]

    for (var i = 0; i < entities.length; ++i) 
        text = text.replace(new RegExp('&'+entities[i][0]+';', 'g'), entities[i][1])

    return text
  }

  const formattedText = segmenter.array.map((segment, index) => {
    const text = data.full_text.slice(segment.start, segment.end + 1)
    switch (segment.value.style) {
      case 'normal':
        return (
          <span>
            {decodeHTMLEntities(text)}
          </span>
        )
      case 'link':
        return (
          <ExternalLink key={index} href={segment.value.href}>{segment.value.display}</ExternalLink>
        )
      case 'hide':
      default:
        return null
    }
  })

  const logContents = () => {
    console.log('tweet', {
      data, segmenter
    })
  }

  const authorProfileUrl = "https://twitter.com/i/user/" + authorId

  const date = new Date(data.created_at)

  return (
    <div className="Tweet">
      {isRetweet && <div className="Tweet-retweetBanner">
        {retweetIcon} {account.accountDisplayName} Retweeted
      </div>}
      <header className="Tweet-header">
        <span className="Tweet-displayWrapper">
          <ExternalLink href={authorProfileUrl}>
            <span className="Tweet-displayName">{authorDisplayName}</span>
            <span className="Tweet-displayHandle"> @{authorUsername}</span>
          </ExternalLink>
        </span>
        <span> · </span>
        <span className="Tweet-date">
          <ExternalLink href={url}>
            {date.toLocaleString()}
          </ExternalLink>
        </span>
      </header>
      {data.in_reply_to_screen_name && (
        <div className="Tweet-inReplyTo">
          <span>Replying to </span>
          <ExternalLink href={`https://twitter.com/i/user/${data.in_reply_to_user_id_str}`}>
            @{data.in_reply_to_screen_name}
          </ExternalLink>
        </div>
      )}
      <p className="Tweet-body">{formattedText}</p>
      {media.length > 0 && (
        <div className="Tweet-mediaSection">{media}</div>
      )}
      <footer className="Tweet-footer">
        <div className="Tweet-footerItem">
          {retweetIcon}
          {data.retweet_count}
        </div>
        <div className="Tweet-footerItem">
          {likeIcon}
          {data.favorite_count}
        </div>
        <button onClick={logContents}>Log Contents</button>
      </footer>
    </div>
  );
}
