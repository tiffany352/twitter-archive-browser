import React from 'react'
import './ExternalLink.css'
const { shell } = require('electron').remote

export default function ExternalLink(props) {
  const href = props.href

  const click = (event) => {
    event.preventDefault()
    shell.openExternal(href)
  }

  return (
    <a className={props.className} onClick={click} href={href}>
      {props.children}
    </a>
  )
}
