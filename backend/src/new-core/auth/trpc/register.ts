import { z } from 'zod';
import { commonPasswords } from './common-passwords';

export const registerSchema = z.object({
  username: z.string()
    .min(3)
    .max(20)
    .regex(/^[\w\S]*$/),
  email: z.string()
    .email()
    .max(254)
    .transform(email => email.toLowerCase()),
  password: z.string()
    .min(8)
    .max(30)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .refine(pwd => !commonPasswords.includes(pwd.toLowerCase()), {
      message: 'Password is too common'
    })
});

export const registerProcedure = t.procedure
  .input(registerSchema)
  .mutation(async ({ input, ctx }) => {
    const exists = await db.query.users.findFirst({
      where: (users, { or, eq }) => 
        or(eq(users.email, input.email), eq(users.username, input.username))
    });

    if (exists) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(input.password);
    
    const [user] = await db.insert(users).values({
      username: input.username,
      email: input.email,
      password: hashedPassword
    }).returning();

    return {
      id: user.id,
      email: user.email
    };
  });
