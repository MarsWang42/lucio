import { Cmd } from '../../../src';
import api from '../api';

export default {
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
};
