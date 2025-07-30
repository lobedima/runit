import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: number;
      email: string;
      isAdmin: boolean;
    } | null;
  }
}

export const jwtPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(import('@fastify/jwt'), jwtConfig);
  await fastify.register(import('@fastify/cookie'));

  fastify.decorateRequest('user', null);
  
  fastify.addHook('onRequest', async (request) => {
    try {
      const token = request.cookies.access_token;
      if (token) {
        const decoded = await request.jwtVerify(token);
        request.user = {
          id: decoded.sub,
          email: decoded.email,
          isAdmin: decoded.isAdmin
        };
      }
    } catch (err) {
      request.log.error(err);
    }
  });
};

export default fp(jwtPlugin);
