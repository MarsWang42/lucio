import { Lucio } from '../../src';
import todoModel from './models/todos';
import counterModel from './models/counter';
import routes from './routes';

const app = new Lucio();

app.model(todoModel);
app.model(counterModel);

// const logger = store => next => action => {
//   console.group(action.type)
//   console.info('dispatching', action)
//   let result = next(action)
//   console.log('next state', store.getState())
//   console.groupEnd(action.type)
//   return result
// }

app.view(routes);

app.start('main');

// app.use([{ name: 'log', enhancer: logger }]);
// app.unuse(['log', 'logger']);

/* Uncomment this part to try linking your own reducer. */
// const newReducer = {
//   todo: (state = { name: 'none' }, action) => {
//     switch (action.type) {
//       case 'todos/createSuccess':
//         return { ...state, name: action.name };
//       default:
//         return state;
//     }
//   },
// };
//
// app.link(newReducer);

