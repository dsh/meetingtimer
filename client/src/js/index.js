// import 'babel-core/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Router, {Route} from 'react-router'
import {createStore, combineReducers} from 'redux'
import { Provider } from 'react-redux'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import { syncReduxAndRouter } from 'redux-simple-router'

import MeetingApp from './containers/MeetingApp'
import NewMeetingContainer from './containers/NewMeeting'
import MeetingContainer from './containers/Meeting'

import configureStore from './store/configureStore'


const store = configureStore();
const history = createBrowserHistory();

syncReduxAndRouter(history, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route component={MeetingApp}>
        <Route path="/" component={NewMeetingContainer} />
        <Route path="/m/:meetingId" component={MeetingContainer} />
      </Route>
    </Router>
  </Provider>,
  document.getElementById("application")
);
