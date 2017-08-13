# Lucio
Simple, intuitive, composable state management for React apps.

Inspired by [dva](https://github.com/dvajs/dva), based on [redux](https://github.com/reactjs/redux), [redux-loop](https://github.com/redux-loop/redux-loop).

---
## Installation
```
npm install --save react-lucio
```

## How to use

First, import your Lucio and create it.

```js
import React from 'react';
import { Lucio, Cmd, connect } from 'react-lucio';

// Fake async api simulating http requests.
const api = {
  counter: {
    compute: (value) => new Promise(function(resolve) {
      setTimeout(() => resolve(value), 200);
    }),
  }
}

// Create your Lucio
const app = new Lucio();
```

Then define an elm-like state management architeture for your Lucio.

``` js
app.model({
  name: 'counter',

  // Initial State
  state: {
    isLoading: false,
    value: 0,
  },

  // Use redux-loop syntax side effects
  effects: {
    compute: (state, action) => Cmd.run(api.counter.compute, {
      successActionCreator: (value) => ({ type: 'counter/computeSuccess', value }),
      failActionCreator: (error) => ({ type: 'todos/computeFailed', error }),
      args: [action.value]
    }),
  },

  // Your reducers
  reducers: {
    compute: (state) =>
      ({ ...state, isLoading: true }),
    computeSuccess: (state, action) =>
      ({ ...state, value: state.value + action.value, isLoading: false }),
    computeFailed: (state, action) =>
      ({ ...state, error: action.error, isLoading: true }),
  },
});
```
Now write down your React component, connect it to the store and load it to the view.
```js
const Counter = ({ value, dispatch }) => (
  <div>
    <div>{ value }</div>
    <div>
      <button onClick={() => dispatch({ type: 'counter/compute', value: 1 })}>+</button>
      <button onClick={() => dispatch({ type: 'counter/compute', value: -1 })}>-</button>
    </div>
  </div>
)

const counterMapStateToProps = state => {
  return {
    value: state.counter.value,
  }
};

const CounterContainer = connect(counterMapStateToProps)(Counter);

// Load your React components
app.view(
  <CounterContainer />
);
```
You're all set! Start it in your DOM now!
```js
// Mount your Lucio onto the DOM node <main />
app.start('main');
```
## Wanna use router?
It can't be easier. Just import the router replace your view in to a function.
``` js
import { Router, Route } from 'react-lucio';
app.view(history => (
  <Router history={history}>
    <Route path="/" component={CounterContainer} />
  </Router>
));
```
## Wanna import some redux-flavor reducers?
Try `app.link()`!
```js
import { reducer as formReducer } from 'redux-form';
app.link({ form: formReducer });
```
## Wanna feed in more middlewares?
Try `app.use()`! Note: some middlewares might not play well since we're using `redux-loop` for handling side-effects.
```js
app.use([yourMiddleware1, yourMiddleware2]);
```
