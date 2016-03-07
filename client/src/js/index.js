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
import MyMeetingsContainer from './containers/MyMeetings'
import About from './components/About'
import store from './store'
import {clearMeeting} from './actions'
const startsWith = require('lodash/string/startsWith');


const history = createBrowserHistory();

syncReduxAndRouter(history, store);

const isIE = navigator.userAgent.indexOf('MSIE')!==-1 || navigator.appVersion.indexOf('Trident/') > 0;

var app;
if (isIE) {
  app = <p style={{padding:"20px"}}>Sorry. Internet Explorer is not supported.</p>
}
else {
  app = <Provider store={store}>
    <Router history={history}>
      <Route component={MeetingApp}>
        <Route path="/" component={NewMeetingContainer} />
        <Route path="/m/:meetingId" component={MeetingContainer} />
        <Route path="/my-meetings" component={MyMeetingsContainer} />
        <Route path="/about" component={About} />
      </Route>
    </Router>
  </Provider>;
}

ReactDOM.render(app, document.getElementById("application"));


// borrowed from https://github.com/rackt/redux/issues/303#issuecomment-125184409
function observeRouteChange(store, onRouteChange) {
  function select(store) {
    return store.routing.path;
  }
  let currentPath;
  function handleChange() {
    let prevPath = currentPath;
    let nextPath = select(store.getState());
    if (nextPath !== currentPath) {
      currentPath = nextPath;
      onRouteChange(prevPath, nextPath);
    }
  }

  let unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
}

observeRouteChange(store, (prevPath, nextPath) => {
  if (startsWith(prevPath, '/m/')) {
    store.dispatch(clearMeeting())
  }
});
