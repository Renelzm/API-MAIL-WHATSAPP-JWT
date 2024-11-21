import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MsgService } from './msg.service';
import { sendMailOptions } from './interfaces/mailinterface';
// import { CreateMsgDto } from './dto/create-msg.dto';
// import { UpdateMsgDto } from './dto/update-msg.dto';

@Controller('msg')
export class MsgController {
  constructor(private readonly msgService: MsgService) {}





  @Post('email/')
  sendEmail(@Body() body: sendMailOptions) {
    return this.msgService.sendMail(body)
  }
  @Post('local/')
  async localconection(
    @Body()  body: { to: string[]; message: string }
  ): Promise<string | object> {
    const { to, message } = body;
    try {
      const isQrActive = await this.msgService.getQr("local-session")
      
    if (isQrActive.active) { 
      const mensaje = await this.msgService.sendMessage({to, message, session: "local-session"});
      return mensaje;
    } else {
      return isQrActive;
    }
          
    } catch (error) {
      return `Error al enviar mensaje: ${error.message}`;
    }
    }
    
  @Post('send/:session')
  async sendMessage(@Param('session') session: string,
    @Body()  body: { to: string[]; message: string }
  ): Promise<string | object> {
    const { to, message } = body;
    try {
      const isQrActive = await this.msgService.getQr(session)
      
    if (isQrActive.active) { 
      const mensaje = await this.msgService.sendMessage({to, message, session});
      return mensaje;
    } else {
      return `El servicio no esta activo `;
    }
          
    } catch (error) {
      return `Error al enviar mensaje: ${error.message}`;
    }
    }
    
    @Get('qr/:session')
   async getQr(@Param('session') session: string,
  ): Promise<string | object> {
    try {
      const mensaje = await this.msgService.getQr(session);
      return mensaje;
    } catch (error) {
      return `Error al enviar mensaje: ${error.message}`;
    }
    }
    
  }