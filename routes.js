import React from 'react';
import { Router, Route, IndexRoute, Redirect, Link } from 'react-router';
import ReactDOM from 'react-dom';
import { createHistory } from 'history';
import Home from './src/scripts/home';
import Items from './src/scripts/items';

ReactDOM.render((
  <Router history={createHistory()}>
    <Route path='/' component={Home} />
    <Route path='/items' component={Items} />
  </Router>
), document.getElementById('yield'));
