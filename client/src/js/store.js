import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './reducers'
import { clearSubmitError } from './actions'
// import createLogger from 'redux-logger';


// Only show the join a meeting error message for a few seconds
const debounceFormErrors = store => next => action => {
  if (action.type == "redux-form/SUBMIT_FAILED") {
    setTimeout(
      () => store.dispatch(clearSubmitError()),
      4000
    );
  }
  return next(action);
};

const delayedActionDispatcher = store => next => action => {
  if (action.meta && action.meta.delayedDispatch) {
    const dd = action.meta.delayedDispatch;
    setTimeout(
      () => store.dispatch(dd.action),
      dd.delay
    );
  }
  return next(action);
};

const createStoreWithMiddleware = applyMiddleware(
  // createLogger(),
  thunkMiddleware,
  debounceFormErrors,
  delayedActionDispatcher
)(createStore);

const store = createStoreWithMiddleware(rootReducer, {})
export default store
