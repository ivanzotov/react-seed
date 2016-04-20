import React from 'react';

export default class App extends React.Component {
  render() {
    return (
      <html>
        <head>
          <title>MyApp</title>
          <link href='/styles/base.css' rel='stylesheet' media='all' />
        </head>
        <body>
          <div id='yield'></div>
          <img src='/images/react.svg' alt='React' />
          <script src='/scripts/base.js'></script>
        </body>
      </html>
    )
  }
}
