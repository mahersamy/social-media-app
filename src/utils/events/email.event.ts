import {EventEmitter} from 'node:events';
import { sendConfirmEmail } from '../email/confirmEmail';

export const emailEvent= new EventEmitter()


emailEvent.on("confirmEmail", async (email: string, otp: string) => {
  await sendConfirmEmail(email, otp);
});
