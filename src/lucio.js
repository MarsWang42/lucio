import invariant from 'invariant';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import isPlainObject from 'is-plain-object';
import logger from 'redux-logger';
import { install, loop, combineReducers } from 'redux-loop';
import { browserHistory } from 'react-router';
import { syncHistoryWithStore, routerReducer } from 'react-router-redux';

const checkModel = (model) => {
  const _model = { ...model };
  const { name, initialState, reducers, effects } = _model;
  invariant(
    name,
    'app.model: model should have a name',
  );
  invariant(
    !initialState || isPlainObject(initialState),
    'app.model: initialState should be an Object',
  );
  invariant(
    !effects || isPlainObject(effects),
    'app.model: effects should be an Object',
  );
  invariant(
    !reducers || isPlainObject(reducers),
    'app.model: reducers should be an Object',
  );
  return model;
};

const createReducer = (model) => {
  const handlers = {};
  const initialState = model.state;
  // Check whether certain action has side effect, if has
  // then create a loop object.
  const actionTypes = Object.keys(model.reducers);
  for (let i = 0, l = actionTypes.length; i < l; i += 1) {
    const actionType = actionTypes[i];
    const nameSpacedActionType = `${model.name}/${actionType}`;
    if (model.effects[actionType]) {
      handlers[nameSpacedActionType] = (state, action) => loop(
        model.reducers[actionType](state, action),
        model.effects[actionType](state, action),
      );
    } else {
      handlers[nameSpacedActionType] = model.reducers[actionType];
    }
  }

  return (state = initialState, action) => {
    if (Object.prototype.hasOwnProperty.call(handlers, action.type)) {
      return handlers[action.type](state, action);
    } else {
      return state;
    }
  };
};

const getViewFromRouter = (router, store) => {
  const history = syncHistoryWithStore(browserHistory, store);
  return router(history);
};

const isHTMLElement = node => (
  typeof node === 'object' && node !== null && node.nodeType && node.nodeName
);

const render = (container, store, view) => {
  ReactDOM.render((
    <Provider store={store}>
      { view }
    </Provider>
  ), container);
};

class Lucio {
  constructor(config = {}) {
    this._initialState = config.initialState || {};
    this._extraReducers = {};
    this._models = [];
    this._config = config;
  }

  // Handling the reducers and effects here.
  model(newModel) {
    this._models.push(checkModel(newModel));
  }

  // Add extra reducers here.
  link(newExtraReducers) {
    invariant(
      isPlainObject(newExtraReducers),
      'app.model: extraReducer should be an Object',
    );
    // Go through all the reducers being linked.
    const newExtraReducerNames = Object.keys(newExtraReducers);
    for (let i = 0, l = newExtraReducerNames.length; i < l; i += 1) {
      const newExtraReducer = newExtraReducers[newExtraReducerNames[i]];
      invariant(
        typeof newExtraReducer === 'function',
        `app.link: ${newExtraReducerNames[i]} should be a function.`,
      );
      this._extraReducers[newExtraReducerNames[i]] = newExtraReducer;
    }
  }

  // Set up the view of the reducer.
  view(newView) {
    invariant(
      typeof newView === 'function' || React.isValidElement(newView),
      'app.view: view should be either function for routing or React element',
    );
    this._view = newView;
  }

  // Mount the app inside the container.
  start(container) {
    // container can be either string or domNode.
    if (typeof container === 'string') {
      container = document.querySelector(container);
      invariant(
        container,
        `app.start: could not query selector: ${container}`,
      );
    }
    invariant(
      !container || isHTMLElement(container),
      'app.start: container should be HTMLElement',
    );

    invariant(
      typeof this._view === 'function' || React.isValidElement(this._view),
      'app.view: view should be either function for routing or React element',
    );


    // Create reducers according to the model.
    const modelReducers = {};
    for (let i = 0, l = this._models.length; i < l; i += 1) {
      const reducer = createReducer(this._models[i]);
      modelReducers[this._models[i].name] = reducer;
    }

    // Add react-router-redux reducer here.
    if (typeof this._view === 'function') {
      this._extraReducers.routing = routerReducer;
    }

    const combinedReducer = combineReducers({
      ...modelReducers,
      ...this._extraReducers,
    });

    const enhancer = compose(
      install(),
      applyMiddleware(logger),
    );

    const store = enhancer(createStore)(combinedReducer, this._initialState);
    if (typeof this._view === 'function') {
      this._view = getViewFromRouter(this._view, store);
    }
    render(container, store, this._view);
  }
}

export default Lucio;
