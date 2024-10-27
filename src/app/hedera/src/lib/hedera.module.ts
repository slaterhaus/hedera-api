import { DynamicModule, Module } from '@nestjs/common';
import { HederaController } from './hedera.controller';
import { HederaService } from './hedera.service';
import { Client, AccountId, PrivateKey } from '@hashgraph/sdk';
import { HederaSecurityProvider } from './providers/hedera-security/hedera-security';
import { HederaHealthController } from './health/health.controller';
import { HealthcheckService } from './health/healthcheck.service';
import { TopicController } from './topic/topic.controller';
import { TopicService } from './topic/topic.service';

type Network = { [key: string]: string | AccountId };
export interface HederaConfig {
  operatorId: string;
  operatorKey: string;
  network: Network;
}

@Module({
  controllers: [HederaController, HederaHealthController, TopicController],
  providers: [HederaService, TopicService, HealthcheckService, HederaSecurityProvider],
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
