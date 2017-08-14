import React from 'react';
import express from 'express';
import { renderToString } from 'react-dom/server';
import createHistory from 'history/createMemoryHistory';
import fetchComponentData from './src/helpers/fetchComponentData';
import { Lucio, RouterContext, match } from '../src';
import todoModel from './src/models/todos';
import counterModel from './src/models/counter';
import { ssrRoutes } from './src/routes';

const app = express();

app.use(express.static('./dist'));

app.use((req, res) => {
  const history = createHistory();

  // Get the current location.
  const location = history.location;

  match({ routes: ssrRoutes, location }, (err, redirectLocation, renderProps) => {
    if (err) {
      return res.status(500).end('Internal server error');
    }

    if (!renderProps) {
      return res.status(404).end('Not found');
    }

    // Get your lucio.
    const lucio = new Lucio();
    lucio.model(todoModel);
    lucio.model(counterModel);
    lucio.view(<RouterContext {...renderProps} />);

    const { provider, store } = lucio.start();

    function renderView() {
      const InitialView = provider;

      const componentHTML = renderToString(InitialView);

      const initialState = store.getState();

      const HTML = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Feedme</title>

            <script>
              window.__INITIAL_STATE__ = ${JSON.stringify(initialState)};
            </script>
          </head>
          <body>
            <main>${componentHTML}</main>
            <script type="application/javascript" src="/js/bundle.js"></script>

          </body>
        </html>
      `;

      return HTML;
    }

    fetchComponentData(store.dispatch, renderProps.components, renderProps.params)
      .then(renderView)
      .then(html => res.end(html))
      .catch(err => res.end(err.message));
  });
});

export default app;
