import $ from 'jquery';
import React from 'react';
import { Router, Route, IndexRoute, Redirect, Link } from 'react-router';
import ReactDOM from 'react-dom';
import { createHistory } from 'history';

window.currentUser = {};

ReactDOM.render((
  <Router history={createHistory()}>
    <Route path='/' component={Home} />
  </Router>
), document.getElementById('yield'));
