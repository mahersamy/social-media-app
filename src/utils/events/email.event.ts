import {EventEmitter} from 'node:events';
import { sendConfirmEmail } from '../email/send.email';

export const emailEvent= new EventEmitter()


emailEvent.on("confirmEmail", async (email: string, otp: string) => {
  await sendConfirmEmail(email, otp);
});
