import React from 'react';
import { connect } from '../../../src';

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

export default connect(todosMapStateToProps)(Todos);

