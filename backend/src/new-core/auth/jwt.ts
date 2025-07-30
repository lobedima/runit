import { FastifyJWTOptions } from '@fastify/jwt';
import { env } from '../config/env';

export const jwtConfig: FastifyJWTOptions = {
  secret: env.NODE_ENV === 'production' ? env.JWT_SECRET : env.JWT_SECRET_DEV,
  cookie: {
    cookieName: 'access_token',
    signed: true
  },
  sign: {
    expiresIn: env.NODE_ENV === 'test' ? '10s' : '60m'
  }
};
