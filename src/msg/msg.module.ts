import { Module } from '@nestjs/common';
import { MsgService } from './msg.service';
import { MsgController } from './msg.controller';
import { EmailService } from './providers/mailprovider';

@Module({
  imports: [EmailService],
  controllers: [MsgController],
  providers: [MsgService],
})
export class MsgModule {}
