import { Resend } from 'resend'; // или другой email-клиент

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async ({
  email,
  token,
  frontendUrl
}: {
  email: string;
  token: string;
  frontendUrl: string;
}) => {
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  
  await resend.emails.send({
    from: 'no-reply@runit.hexlet.ru',
    to: email,
    subject: 'Password Reset Instructions',
    html: `
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 30 minutes.</p>
    `
  });
};