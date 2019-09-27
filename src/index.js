import React from 'react'
import ReactDOM from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import './index.css'
import App from './components/App'
import reducer from './reducer'
import * as serviceWorker from './serviceWorker'

const store = createStore(reducer)

const rootElement = (
  <Provider store={store}>
    <App />
  </Provider>
)

ReactDOM.render(rootElement, document.getElementById('root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
