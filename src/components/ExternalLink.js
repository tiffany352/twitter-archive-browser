import React from 'react'
import './ExternalLink.css'
const { shell } = require('electron').remote

export default function ExternalLink(props) {
  const href = props.href

  const click = () => {
    shell.openExternal(href)
  }

  return (
    <button className="link-button" onClick={click}>
      {props.children}
    </button>
  )
}
