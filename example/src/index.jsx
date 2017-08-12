import React from 'react';
import { Lucio, Cmd, connect, Link, Router, Route } from '../../src';

const api = {
  todos: {
    create: name => new Promise((resolve) => {
      setTimeout(() => resolve(name), 200);
    }),
    toggle: id => new Promise((resolve) => {
      setTimeout(() => resolve(id), 200);
    }),
  },
  counter: {
    compute: value => new Promise((resolve) => {
      setTimeout(() => resolve(value), 200);
    }),
  },
};

const app = new Lucio();

app.model({
  name: 'todos',
  state: {
    isLoading: false,
    collections: [],
  },
  effects: {
    createTodo: (state, action) => Cmd.run(api.todos.create, {
      successActionCreator: name => ({ type: 'todos/createSuccess', name }),
      failActionCreator: error => ({ type: 'todos/createFailed', error }),
      args: [action.name],
    }),
    toggleTodo: (state, action) => Cmd.run(api.todos.toggle, {
      successActionCreator: id => ({ type: 'todos/toggleSuccess', id }),
      failActionCreator: error => ({ type: 'todos/toggleFailed', error }),
      args: [action.id],
    }),
  },
  reducers: {
    createTodo: state =>
      ({ ...state, isLoading: true }),
    createSuccess: (state, action) =>
      ({
        ...state,
        collections: [
          ...state.collections,
          { name: action.name, id: state.collections.length, isOpen: true },
        ],
        isLoading: true,
      }),
    createFailed: (state, action) =>
      ({ ...state, error: action.error, isLoading: true }),
    toggleTodo: state =>
      ({ ...state, isLoading: true }),
    toggleSuccess: (state, action) => {
      const updatedCollections = [...state.collections].map((o) => {
        if (o.id === action.id) o.isOpen = !o.isOpen;
        return o;
      });
      return { ...state, collections: updatedCollections, isLoading: true };
    },
    toggleFailed: (state, action) =>
      ({ ...state, error: action.error, isLoading: true }),
  },
});

app.model({
  name: 'counter',
  state: {
    isLoading: false,
    value: 0,
  },
  effects: {
    compute: (state, action) => Cmd.run(api.counter.compute, {
      successActionCreator: value => ({ type: 'counter/computeSuccess', value }),
      failActionCreator: error => ({ type: 'todos/computeFailed', error }),
      args: [action.value],
    }),
  },
  reducers: {
    compute: state =>
      ({ ...state, isLoading: true }),
    computeSuccess: (state, action) =>
      ({ ...state, value: state.value + action.value, isLoading: false }),
    computeFailed: (state, action) =>
      ({ ...state, error: action.error, isLoading: true }),
  },
});

const Todos = ({ todos, dispatch }) => (
  <ul>
    <li>
      <input
        onKeyPress={({ target, key }) => {
          if (key === 'Enter') {
            dispatch({
              type: 'todos/createTodo',
              name: target.value,
            });
          }
        }}
      />
    </li>
    {todos.collections.map(todo => (
      todo.isOpen ? (
        <div
          key={todo.id}
          onClick={() => {
            dispatch({
              type: 'todos/toggleTodo',
              id: todo.id,
            });
          }}
        >
          { todo.name }
        </div>
      ) : (
        <div key={todo.id} >
          <strike
            onClick={() => {
              dispatch({
                type: 'todos/toggleTodo',
                id: todo.id,
              });
            }}
          >
            { todo.name }
          </strike>
        </div>
      )
    ))}
  </ul>
);

const todosMapStateToProps = state => ({
  todos: state.todos,
});

const TodosContainer = connect(todosMapStateToProps)(Todos);

const Counter = ({ value, dispatch }) => (
  <div>
    <div>{ value }</div>
    <div>
      <button onClick={() => dispatch({ type: 'counter/compute', value: 1 })}>+</button>
      <button onClick={() => dispatch({ type: 'counter/compute', value: -1 })}>-</button>
    </div>
  </div>
);

const counterMapStateToProps = state => ({
  value: state.counter.value,
});

const CounterContainer = connect(counterMapStateToProps)(Counter);

const Home = () => (
  <ul>
    <li>
      <Link to="/todo">Todo</Link>
    </li>
    <li>
      <Link to="/counter">Counter</Link>
    </li>
  </ul>
);

/* Uncomment here to use view without routing. */
// app.view(
//   <div>
//     <TodosContainer />
//     <CounterContainer />
//   </div>,
// );

app.view(history => (
  <Router history={history}>
    <Route path="/" component={Home} />
    <Route path="/todo" component={TodosContainer} />
    <Route path="/counter" component={CounterContainer} />
  </Router>
));

app.start('main');

