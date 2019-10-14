import React, { useContext } from 'react'
import { Route, useHistory } from 'react-router'
import Message from './Message'
import SessionContext from './SessionContext'
import MediaViewer from './MediaViewer'
import useQuery from '../useQuery'
import './MessagesPage.css'

function ConversationListItem(props) {
  const { session } = useContext(SessionContext)
  const history = useHistory()
  const screenNames = session.screen_names
  const { accountId } = session.account
  const convo = props.convo

  const ids = convo.conversationId.split('-')
  const other = ids.find((id) => id !== accountId)
  const otherName = screenNames[other]

  return (
    <button
      className="MessagesPage-conversationListItem"
      onClick={() => history.push(`/archive/messages/conversation/${convo.conversationId}/`)}
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
  const { session } = useContext(SessionContext)
  const conversations = session.direct_message

  return (
    <div className="MessagesPage-conversationList">
      {conversations.map((convo, index) => (
        <ConversationListItem convo={convo} key={index} />
      ))}
    </div>
  )
}

function ConversationView(props) {
  const { session: { direct_message } } = useContext(SessionContext)
  const query = useQuery()

  const convoId = props.match.params.convoId
  const convo = direct_message.find((convo) => convo.conversationId === convoId)
  if (!convo) {
    return null
  }
  const search = query.get('search')
  const needle = search && search.toLowerCase()
  const messages = convo.messages.slice().reverse().filter((message) => (
    !needle || message.text.toLowerCase().includes(needle)
  ))

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
  return (
    <>
      <aside className="Session-sidebar">
        <ConversationList />
      </aside>
      <article className="Session-content">
        <Route path="/archive/messages/conversation/:convoId" component={ConversationView} />
      </article>
      <MediaViewer />
    </>
  )
}
