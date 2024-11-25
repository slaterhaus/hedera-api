// hedera/healthcheck.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Client, PublicKey, TopicCreateTransaction, TopicId, TopicMessageSubmitTransaction } from '@hashgraph/sdk';

@Injectable()
export class HederaService {
  constructor(
    @Inject('HEDERA_CLIENT')
    private readonly client: Client
  ) {}

  async createTopic() {
    const transaction = await new TopicCreateTransaction()
      .setSubmitKey(this.client.operatorPublicKey as PublicKey)
      .execute(this.client);

    const receipt = await transaction.getReceipt(this.client);
    return receipt.topicId;
  }

  async submitMessage(topicId: TopicId, message: string) {
    const transaction = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute(this.client);

    return transaction.getReceipt(this.client);
  }
  async getClient() {
    return this.client;
  }
  async executeTransaction<T>(transaction: T) {
    const execution = await (transaction as any).execute(this.client);
    return execution.getReceipt(this.client);
  }
}
