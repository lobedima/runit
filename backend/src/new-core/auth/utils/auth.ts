import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { db } from '../../db/drizzle';
import { eq } from 'drizzle-orm';
import { passwordResetTokens } from '../../db/schema';
import { sendPasswordResetEmail } from '../../mailer';

export const authRouter = router({
  forgotPassword: publicProcedure
    .input(z.object({
      email: z.string().email(),
      frontendUrl: z.string().url()
    }))
    .mutation(async ({ input }) => {
      const user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email)
      });

      if (!user) {
        // Логируем попытку, но не сообщаем об ошибке
        return { success: true };
      }

      // Проверяем, есть ли активный токен
      const existingToken = await db.query.passwordResetTokens.findFirst({
        where: (tokens, { and, eq, gt }) => 
          and(
            eq(tokens.userId, user.id),
            eq(tokens.used, false),
            gt(tokens.expiresAt, new Date())
          )
      });

      if (existingToken) {
        // Можно добавить rate limiting здесь
        return { success: true };
      }

      // Генерируем новый токен
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 минут

      await db.insert(passwordResetTokens).values({
        token,
        email: user.email,
        userId: user.id,
        expiresAt,
        used: false
      });

      await sendPasswordResetEmail({
        email: user.email,
        token,
        frontendUrl: input.frontendUrl
      });

      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(z.object({
      token: z.string(),
      newPassword: z.string()
        .min(8)
        .regex(/[a-z]/)
        .regex(/[A-Z]/)
        .regex(/[0-9]/)
    }))
    .mutation(async ({ input }) => {
      const tokenRecord = await db.query.passwordResetTokens.findFirst({
        where: (tokens, { and, eq, gt }) => 
          and(
            eq(tokens.token, input.token),
            eq(tokens.used, false),
            gt(tokens.expiresAt, new Date())
          )
      });

      if (!tokenRecord) {
        throw new Error('Invalid or expired token');
      }

      // Проверка пароля (можно добавить проверку на сложность)
      
      // Обновляем пароль
      await db.update(users)
        .set({ password: await hashPassword(input.newPassword) })
        .where(eq(users.id, tokenRecord.userId));

      // Помечаем токен как использованный
      await db.update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, tokenRecord.id));

      return { success: true };
    })
});
