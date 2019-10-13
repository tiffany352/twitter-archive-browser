import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Html5Entities } from 'html-entities'
import ExternalLink from './ExternalLink'
import Segmenter from '../Segmenter'
import './Message.css'
const https = require('https')

const shortLinkCache = new Map()
async function resolveShortLink(href) {
  const cached = shortLinkCache.get(href)
  if (cached) {
    return cached
  }

  console.log('resolveShortLink', href)

  const result = await new Promise((resolve, reject) => {
    https.get(href, (response) => {
      const result = response.headers.location || null
      console.log('resolveShortLink result', result, response)
      shortLinkCache.set(href, result)
      resolve(result)
  
    }).on('error', (error) => {
      console.log('resolveShortLink error', error)
    })
  })
  shortLinkCache.set(href, result)
  return result
}

// This only exists because DMs don't include entity information.
function TwitterShortLink(props) {
  const [ realUrl, setRealUrl ] = useState(null)

  resolveShortLink(props.href).then((realUrl) => {
    setRealUrl(realUrl)
  })

  const stickerPattern = /^https:\/\/twitter\.com\/i\/stickers\/image\/([0-9]+)$/
  if (realUrl && stickerPattern.test(realUrl)) {
    return (
      <img src={realUrl} alt="Sticker" />
    )
  }

  const mediaPattern = /^https:\/\/twitter\.com\/messages\/media\/([0-9]+)$/
  if (realUrl && mediaPattern.test(realUrl)) {
    return (
      <img src={realUrl} alt="Media" />
    )
  }

  return (
    <ExternalLink href={props.href}>{realUrl || props.href}</ExternalLink>
  )
}

function MessageMedia(props) {
  const [ mediaUrl, setMediaUrl ] = useState(null)
  const mediaProvider = useSelector((state) => state.session.direct_message_media)

  mediaProvider.getDirectMessageMediaUrl(props.url).then((mediaUrl) => {
    setMediaUrl(mediaUrl)
  })

  return (
    <div className="Message-media">
      <img alt="" src={mediaUrl} />
    </div>
  )
}

export default function Message(props) {
  const accountId = useSelector((state) => state.session.account.accountId)
  const message = props.message

  const isSelf = message.senderId === accountId
  const date = message.createdDate

  if (message.mediaUrls.length > 0) {
    console.log('has media urls', message)
    return (
      <div className="Message-container" data-isself={isSelf} data-ismedia="true">
        {message.mediaUrls.map((url, index) => <MessageMedia key={index} url={url} />)}
        <div className="Message-date">{date.toLocaleTimeString()}</div>
      </div>
    )
  }

  const text = Html5Entities.decode(message.text)
  const segmenter = new Segmenter(text.length, { style: 'normal' })

  const linkPattern = /https?:\/\/t\.co\/[^\s]*/g
  for (const match of text.matchAll(linkPattern)) {
    segmenter.setSpan(match.index, match.index + match[0].length - 1, {
      style: 'link',
      href: match[0],
    })
  }

  const segments = segmenter.array.map(({ start, end, value }, index) => {
    const slice = text.slice(start, end+1)
    switch (value.style) {
      case 'normal':
        return <span key={index}>{slice}</span>
      case 'link':
        return <TwitterShortLink key={index} href={value.href} />
      default:
        return null
    }
  })

  return (
    <div className="Message-container" data-isself={isSelf}>
      <p>{segments}</p>
      <div className="Message-date">{date.toLocaleTimeString()}</div>
    </div>
  )
}
