import React from 'react';
import { Link } from '../../../src';

export default () => (
  <ul>
    <li>
      <Link to="/todo">Todo</Link>
    </li>
    <li>
      <Link to="/counter">Counter</Link>
    </li>
  </ul>
);

