// import 'babel-core/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import Router, {Route} from 'react-router'
import {createStore} from 'redux'
import { Provider } from 'react-redux'
import createBrowserHistory from 'history/lib/createBrowserHistory'
import { syncReduxAndRouter } from 'redux-simple-router'
import MeetingApp from './containers/MeetingApp'
import NewMeetingContainer from './containers/NewMeeting'
import MeetingContainer from './containers/Meeting'
import About from './components/About'
import store from './store'


const history = createBrowserHistory();

syncReduxAndRouter(history, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route component={MeetingApp}>
        <Route path="/" component={NewMeetingContainer} />
        <Route path="/m/:meetingId" component={MeetingContainer} />
        <Route path="/about" component={About} />

      </Route>
    </Router>
  </Provider>,
  document.getElementById("application")
);
