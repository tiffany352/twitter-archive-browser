import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Html5Entities } from 'html-entities'
import './MessagesPage.css'
import Segmenter from '../Segmenter'
import ExternalLink from './ExternalLink'
const https = require('https')

function parseDate(date) {
  const isUnix = /^([0-9]+)$/.test(date)
  if (isUnix) {
    return new Date(parseInt(date))
  }

  return new Date(date)
}

function ConversationListItem(props) {
  const [ screenNames, accountId ] = useSelector((state) => [
    state.session.screen_names,
    state.session.account.accountId
  ])
  const convo = props.convo

  const ids = convo.dmConversation.conversationId.split('-')
  const other = ids.find((id) => id !== accountId)
  const otherName = screenNames[other]

  return (
    <button
      className="MessagesPage-conversationListItem"
      onClick={() => props.setCurrentConvo(convo.dmConversation.conversationId)}
    >
      <div className="MessagesPage-conversationListItemName">
        {otherName ? otherName : `Unknown sender (${other})`}
      </div>
      <div className="MessagesPage-conversationListItemDate">
        {parseDate(convo.dmConversation.messages[0] && convo.dmConversation.messages[0].messageCreate.createdAt).toLocaleDateString()}
      </div>
    </button>
  )
}

function ConversationList(props) {
  const conversations = useSelector((state) => state.session['direct-message'] )

  return (
    <div className="MessagesPage-conversationList">
      {conversations.map((convo, index) => (
        <ConversationListItem setCurrentConvo={props.setCurrentConvo} convo={convo} key={index} />
      ))}
    </div>
  )
}

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

  return (
    <ExternalLink href={props.href}>{realUrl || props.href}</ExternalLink>
  )
}

function ConversationMessage(props) {
  const accountId = useSelector((state) => state.session.account.accountId)
  const message = props.message.messageCreate

  const isSelf = message.senderId === accountId

  const date = parseDate(message.createdAt)

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
    <div className="MessagesPage-message" data-isself={isSelf}>
      <p>{segments}</p>
      <div className="MessagesPage-messageDate">{date.toLocaleTimeString()}</div>
    </div>
  )
}

function ConversationView(props) {
  const messages = useSelector((state) => {
    const convos = state.session['direct-message']
    const convo = convos.find((convo) => convo.dmConversation.conversationId === props.convoId)
    return convo.dmConversation.messages
  }).slice().reverse()

  console.log('messages', messages)

  let lastMessage
  return (
    <div className="Session-contentInner">
      <div className="MessagesPage-conversationView">
        {messages.map((message, index) => {
          const date = parseDate(message.messageCreate.createdAt)
          const showDate = lastMessage === undefined || !(
            date.getFullYear() === lastMessage.getFullYear() &&
            date.getMonth() === lastMessage.getMonth() &&
            date.getDay() === lastMessage.getDay()
          )
          lastMessage = date
          return (
            <React.Fragment key={index}>
              {showDate && (
                <hr className="MessagesPage-divider" data-display={date.toLocaleDateString()} />
              )}
              <ConversationMessage message={message} />
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default function MessagesPage(props) {
  const [ currentConvo, setCurrentConvo ] = useState(null)

  return (
    <>
      <aside className="Session-sidebar">
        <ConversationList setCurrentConvo={setCurrentConvo} />
      </aside>
      <article className="Session-content">
        {currentConvo && (
          <ConversationView convoId={currentConvo} />
        )}
      </article>
    </>
  )
}
