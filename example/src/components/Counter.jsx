import React from 'react';
import { connect } from '../../../src';

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

export default connect(counterMapStateToProps)(Counter);
