import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
// import createLogger from 'redux-logger'
import rootReducer from './../reducers'

const createStoreWithMiddleware = applyMiddleware(
  // createLogger(),
  thunkMiddleware
)(createStore);

export default function configureStore(initialState = {}) {
  return createStoreWithMiddleware(rootReducer, initialState)
}
