import React from 'react';
import { Router, Route, IndexRoute, Redirect, Link } from 'react-router';
import ReactDOM from 'react-dom';
import { createHistory } from 'history';
import Home from './src/scripts/home';
import HelloWorld from './src/scripts/hello-world';

ReactDOM.render((
  <Router history={createHistory()}>
    <Route path='/' component={Home} />
    <Route path='/hello/world' component={HelloWorld} />
  </Router>
), document.getElementById('yield'));
