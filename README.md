# Lucio
Simple, intuitive, composable state management for React apps.

Inspired by [dva](https://github.com/dvajs/dva), based on [redux](https://github.com/reactjs/redux), [redux-loop](https://github.com/redux-loop/redux-loop)

---


### Example

```js
import React from 'react';
import { createLucio, Cmd, connect } from 'lucio';

// Fake async api simulating http requests.
const api = {
  counter: {
    compute: (value) => new Promise(function(resolve) {
      setTimeout(() => resolve(value), 200);
    }),
  }
}

// Create your Lucio
const app = createLucio();

// Define an elm-like architeture for your Lucio
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

  reducers: {
    compute: (state) =>
      ({ ...state, isLoading: true }),
    computeSuccess: (state, action) =>
      ({ ...state, value: state.value + action.value, isLoading: false }),
    computeFailed: (state, action) =>
      ({ ...state, error: action.error, isLoading: true }),
  },
});

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

// Mount your Lucio onto the DOM
app.start('main');

```
