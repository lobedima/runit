import { router } from '../trpc';
import { localAuthProcedure } from './local';
import { registerProcedure } from './register';
import { forgotPasswordProcedure, resetPasswordProcedure } from './password-reset';

export const authRouter = router({
  login: localAuthProcedure,
  register: registerProcedure,
  forgotPassword: forgotPasswordProcedure,
  resetPassword: resetPasswordProcedure
});
