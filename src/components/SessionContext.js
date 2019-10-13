import React from 'react'

const SessionContext = React.createContext({
  session: null,
  setSession: (newSession) => {},
})
export default SessionContext
