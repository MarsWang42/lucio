export default {
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
