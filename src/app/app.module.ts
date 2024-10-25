import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HederaModule } from '@hedera-api/hedera';

@Module({
  imports: [HederaModule.forRoot({
    network: {[process.env.NETWORK_KEY]: process.env.NETWORK_VALUE},
    operatorId: process.env.MY_ACCOUNT_ID,
    operatorKey: process.env.MY_PRIVATE_KEY,
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
