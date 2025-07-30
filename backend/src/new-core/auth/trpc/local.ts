import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { comparePasswords } from '../utils/auth';
import { db } from '../../db/drizzle';

const t = initTRPC.create();

export const localAuthProcedure = t.procedure
  .input(z.object({
    email: z.string().email(),
    password: z.string()
  }))
  .mutation(async ({ input }) => {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, input.email)
    });

    if (!user || !(await comparePasswords(input.password, user.password))) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    };
  });
