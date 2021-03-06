const Koa = require('koa');
const { ApolloServer } = require('apollo-server-koa');
const next = require('next');

// process.env config
require('dotenv').config();
const schema = require('./graphql');
const models = require('./sequelize');
const db = require('./sequelize/sequelize');
const logger = require('./logger');
const routes = require('./routes');

const port = parseInt(process.env.PORT, 10);
const server = new Koa();
const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev, dir: './client' });
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
  // logger setting
  server.use(async (ctx, next) => {
    logger.info(`[${ctx.method}] ${ctx.path}`);
    await next();
  });

  // graphql server setting
  const buildContext = async ({ ctx }) => {
    return { ctx, models, db };
  };
  const graphqlServer = new ApolloServer({
    schema,
    context: buildContext,
  });
  graphqlServer.applyMiddleware({ app: server, path: '/graphql' });

  // next router app setting

  server.use(async (ctx, next) => {
    if (ctx.request.method.toUpperCase() === 'GET') {
      await handler(ctx.req, ctx.res);
      ctx.respond = false;
    } else {
      await next();
    }
  });

  server.listen({ port }, () =>
    console.log(`Server ready at http://localhost:${port}${graphqlServer.graphqlPath}`)
  );
});
