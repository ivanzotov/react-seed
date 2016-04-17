import $ from 'jquery';
import React from 'react';
import { Router, Route, IndexRoute, Redirect, Link } from 'react-router';
import ReactDOM from 'react-dom';
import { createHistory } from 'history';
import Home from './src/scripts/home';

ReactDOM.render((
  <Router history={createHistory()}>
    <Route path='/' component={Home} />
  </Router>
), document.getElementById('yield'));
