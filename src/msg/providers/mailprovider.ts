const nodemailer = require("nodemailer");
import { sendMailOptions } from '../interfaces/mailinterface';


export class  EmailService {
    private transporter = nodemailer.createTransport({
        service: process.env.MAILER_SERVICE,
        auth: {
            user: process.env.MAILER_EMAIL,
            pass: process.env.MAILER_SECRET_KEY,
        }
    });


    async sendEmail( options: sendMailOptions):Promise<boolean>{
        const { to, subject, htmlBody} = options
        try {
           
            const sendInformation = await this.transporter.sendMail({ 
                to: to,
                subject: subject,
                html: htmlBody,
            });
            console.log(sendInformation);
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

