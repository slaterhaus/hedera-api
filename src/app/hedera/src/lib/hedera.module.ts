import { DynamicModule, Module } from '@nestjs/common';
import { HederaController } from './hedera.controller';
import { HederaService } from './hedera.service';
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { HederaSecurityProvider } from './providers/hedera-security/hedera-security';
import { HederaHealthController } from './health/health.controller';
import { HealthcheckService } from './health/healthcheck.service';
import { TopicController } from './topic/topic.controller';
import { TopicService } from './topic/topic.service';
import { FileService } from './file/file.service';
import { FileController } from './file/file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { TokensService } from './token/token.service';

type Network = { [key: string]: string | AccountId };
export interface HederaConfig {
  operatorId: string;
  operatorKey: string;
  network: Network;
}

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 1024 * 1024 // 1MB limit
      }
    })
  ],
  controllers: [
    HederaController,
    HederaHealthController,
    TopicController,
    FileController,
  ],
  providers: [
    HederaService,
    TopicService,
    HealthcheckService,
    HederaSecurityProvider,
    FileService,
    TokensService,
  ],
  exports: [HederaService],
})
export class HederaModule {
  static forRoot(config: HederaConfig): DynamicModule {
    return {
      module: HederaModule,
      providers: [
        {
          provide: 'HEDERA_CLIENT',
          useFactory: () => {
            const client = Client.forTestnet();
            client.setOperator(config.operatorId, config.operatorKey);
            return client;
          },
        },
        HederaService,
      ],
      exports: [HederaService],
    };
  }
}
