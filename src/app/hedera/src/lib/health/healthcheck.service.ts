// hedera/healthcheck.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Client, PublicKey, TopicCreateTransaction, TopicId, TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { HederaService } from '@hedera-api/hedera';

// hedera/health.service.ts
@Injectable()
export class HealthcheckService {
  constructor(
    @Inject('HEDERA_CLIENT')
    private readonly client: Client
  ) {}
  async checkHealth() {
    const checks = {
      client: await this.checkClientConnection(),
      mirror: await this.checkMirrorConnection(),
      operator: await this.checkOperatorAccount()
    };

    const isHealthy = Object.values(checks)
      .every(check => check.status === 'healthy');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    };
  }

  private async checkClientConnection() {
    try {
      return {
        status: 'healthy',
        networks: Object.keys(this.client.network),
        ledgerId: this.client.ledgerId
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  private async checkMirrorConnection() {
    try {
      return {
        status: 'healthy',
        endpoints: this.client.mirrorNetwork
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  private async checkOperatorAccount() {
    try {
      const operatorId = this.client.operatorAccountId;

      if (!operatorId) {
        throw new Error('No operator account configured');
      }

      return {
        status: 'healthy',
        operatorId: operatorId.toString()
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

