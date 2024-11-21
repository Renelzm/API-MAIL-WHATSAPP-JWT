import { Injectable, Logger  } from '@nestjs/common';
import {  WhatsAppProvider } from './providers/whatsapp.provider';
import { whatsAppInterface } from './interfaces/whatsapp-message.interface';
import { EmailService } from './providers/mailprovider';
import { sendMailOptions } from './interfaces/mailinterface';

@Injectable()
export class MsgService {
  private logger = new Logger(MsgService.name);
  private sock: any;


   async sendMessage({to, message, session}: whatsAppInterface ) {
    return  await WhatsAppProvider( {to, message, session})

  }
   async getQr(session: string) : Promise<any>{
    return await WhatsAppProvider({session})
  }

  async sendMail({ to, subject, htmlBody} : sendMailOptions){
  const emailService = new EmailService();
   await  emailService.sendEmail({
      to: to,
      subject: subject,
      htmlBody: htmlBody,
    })
    if (emailService){
      return "Correo Enviado con exito"
    } else {
      return "Error en el envio de correo"
    }
  }
}
