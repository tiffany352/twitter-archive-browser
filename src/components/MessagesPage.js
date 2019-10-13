import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import Message from './Message'
import './MessagesPage.css'

function ConversationListItem(props) {
  const [ screenNames, accountId ] = useSelector((state) => [
    state.session.screen_names,
    state.session.account.accountId
  ])
  const convo = props.convo

  const ids = convo.conversationId.split('-')
  const other = ids.find((id) => id !== accountId)
  const otherName = screenNames[other]

  return (
    <button
      className="MessagesPage-conversationListItem"
      onClick={() => props.setCurrentConvo(convo.conversationId)}
    >
      <div className="MessagesPage-conversationListItemName">
        {otherName ? otherName : `Unknown sender (${other})`}
      </div>
      <div className="MessagesPage-conversationListItemDate">
        {(convo.messages[0] && convo.messages[0].createdDate).toLocaleDateString()}
      </div>
    </button>
  )
}

function ConversationList(props) {
  const conversations = useSelector((state) => state.session.direct_message)

  return (
    <div className="MessagesPage-conversationList">
      {conversations.map((convo, index) => (
        <ConversationListItem setCurrentConvo={props.setCurrentConvo} convo={convo} key={index} />
      ))}
    </div>
  )
}

function ConversationView(props) {
  const messages = useSelector((state) => {
    const conversations = state.session.direct_message
    const convo = conversations.find((convo) => convo.conversationId === props.convoId)
    return convo.messages
  }).slice().reverse()

  console.log('messages', messages)

  let lastMessage
  return (
    <div className="Session-contentInner">
      <div className="MessagesPage-conversationView">
        {messages.map((message, index) => {
          const date = message.createdDate
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
              <Message message={message} />
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
