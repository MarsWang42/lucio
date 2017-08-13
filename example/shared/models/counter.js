import { Cmd } from '../../../src';
import api from '../api';

export default {
  name: 'counter',
  state: {
    isLoading: false,
    value: 0,
  },
  effects: {
    compute: (state, action) => Cmd.run(api.counter.compute, {
      successActionCreator: value => ({ type: 'counter/computeSuccess', value }),
      failActionCreator: error => ({ type: 'counter/computeFailed', error }),
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
};
