import { Lucio } from '../../src';
import todoModel from './models/todos';
import counterModel from './models/counter';
import routes from './routes';

const app = new Lucio();

app.model(todoModel);
app.model(counterModel);

app.view(routes);

app.start('main');
app.unloadModel('counter');

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

