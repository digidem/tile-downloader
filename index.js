import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(function (reg) {
    // registration worked
      console.log('Registration succeeded. Scope is ' + reg.scope)
    }).catch(function (error) {
    // registration failed
      console.log('Registration failed with ' + error)
    })
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
)
