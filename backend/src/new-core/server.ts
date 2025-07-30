import fastify from 'fastify';
import { authRouter } from './auth/trpc/router';
import { jwtPlugin } from './auth/plugins/jwt';

const server = fastify();

// Подключаем плагины
await server.register(jwtPlugin);
await server.register(import('@fastify/rate-limit'), {
  global: true,
  max: 100,
  timeWindow: '1 minute'
});

// Подключаем tRPC
await server.register(import('@trpc/server/adapters/fastify'), {
  prefix: '/trpc',
  trpcOptions: { router: authRouter }
});

server.listen({ port: 3001 });
