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

// Helper function to check whether a model is valid.
const checkModel = (model) => {
  const m = { ...model };
  const { name, initialState, reducers, effects } = m;
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
  return m;
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
  const provider = (
    <Provider store={store}>
      { view }
    </Provider>
  );
  if (container) {
    ReactDOM.render(provider, container);
    return true;
  } else {
    return { provider, store };
  }
};

class Lucio {
  constructor(config = {}) {
    this._initialState = config.initialState || {};
    this._extraReducers = {};
    this._enhancers = [];
    this._models = [];
    this._config = config;
  }

  // Handling the reducers and effects here.
  model(newModel) {
    newModel = checkModel(newModel);
    this._models.push(newModel);

    // Dynamically add model if app already started.
    if (this._store) {
      const reducer = createReducer(newModel);
      this._modelReducers[newModel.name] = reducer;
      const combinedReducer = combineReducers({
        ...this._modelReducers,
        ...this._extraReducers,
      });
      this._store.replaceReducer(combinedReducer);
    }
  }

  unloadModel(modelName) {
    const modelIndex = this._models.findIndex(model => model.name === modelName);
    invariant(
      modelIndex >= 0,
      `app.unloadModel: model '${modelName} is not mounted yet.'`,
    );
    this._models.splice(modelIndex, 1);

    // Dynamically remove model if app already started.
    if (this._store) {
      delete this._modelReducers[modelName];
      const combinedReducer = combineReducers({
        ...this._modelReducers,
        ...this._extraReducers,
      });
      this._store.replaceReducer(combinedReducer);
    }
  }

  // Load additional middlewares here.
  use(newEnhancers) {
    invariant(
      Array.isArray(newEnhancers),
      'app.use: new enhancers should be an array',
    );
    this._enhancers.push(...newEnhancers);
  }

  // Add extra reducers here.
  link(newExtraReducers) {
    invariant(
      isPlainObject(newExtraReducers),
      'app.model: extra reducers should be an Object',
    );
    // Go through all the reducers being linked.
    const newExtraReducerNames = Object.keys(newExtraReducers);
    for (let i = 0, l = newExtraReducerNames.length; i < l; i += 1) {
      const newExtraReducer = newExtraReducers[newExtraReducerNames[i]];
      invariant(
        typeof newExtraReducer === 'function',
        `app.link: reducer '${newExtraReducerNames[i]}' should be a function.`,
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
    this._modelReducers = {};
    for (let i = 0, l = this._models.length; i < l; i += 1) {
      const reducer = createReducer(this._models[i]);
      this._modelReducers[this._models[i].name] = reducer;
    }

    // Add react-router-redux reducer here.
    if (typeof this._view === 'function') {
      this._extraReducers.routing = routerReducer;
    }

    const combinedReducer = combineReducers({
      ...this._modelReducers,
      ...this._extraReducers,
    });

    // Add logger middle by default and remove it on production.
    if (!this._config.disableLogger && process.env.NODE_ENV !== 'production') {
      this._enhancers.push(logger);
    }

    const enhancer = compose(
      install(),
      applyMiddleware(...this._enhancers),
    );

    const store = enhancer(createStore)(combinedReducer, this._initialState);

    // Create a read only store api
    this._store = { ...store };

    // Create the react component for routing
    if (typeof this._view === 'function') {
      this._view = getViewFromRouter(this._view, store);
    }

    return render(container, store, this._view);
  }
}

export default Lucio;
