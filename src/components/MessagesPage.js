import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import InfiniteScroll from 'react-infinite-scroller'
import './MessagesPage.css'

function ConversationList(props) {
  const conversations = useSelector((state) => state.session['direct-message'])

  return (
    <div className="Session-contentInner">
      <div className="MessagesPage-conversationList">
        {conversations.map((convo, index) => (
          <button
            key={index}
            onClick={() => props.setCurrentConvo(convo.dmConversation.conversationId)}
          >
            {convo.dmConversation.conversationId}
          </button>
        ))}
      </div>
    </div>
  )
}

function ConversationMessage(props) {
  const accountId = useSelector((state) => state.session.account.accountId)
  const message = props.message.messageCreate

  const isSelf = message.senderId === accountId

  const date = new Date(message.createdAt)

  return (
    <div className="MessagesPage-message" data-isself={isSelf}>
      <p>{message.text}</p>
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
          const date = new Date(message.messageCreate.createdAt)
          const sameDay = lastMessage === undefined || (
            date.getFullYear() === lastMessage.getFullYear() &&
            date.getMonth() === lastMessage.getMonth() &&
            date.getDay() === lastMessage.getDay()
          )
          lastMessage = date
          return (
            <>
              {!sameDay && (
                <hr className="MessagesPage-divider" data-display={date.toLocaleDateString()} />
              )}
              <ConversationMessage message={message} key={index} />
            </>
          )
        })}
      </div>
    </div>
  )
}

export default function MessagesPage(props) {
  const [ currentConvo, setCurrentConvo ] = useState(null)

  if (currentConvo) {
    return <ConversationView convoId={currentConvo} />
  }

  return <ConversationList setCurrentConvo={setCurrentConvo} />
}
