import { Inject, Injectable } from '@nestjs/common';
import { Client, TopicCreateTransaction, TransactionReceipt, TransactionResponse } from '@hashgraph/sdk';

@Injectable()
export class TopicService {
  constructor(
    @Inject('HEDERA_CLIENT')
    private readonly client: Client
  ) {}
  async createMasterTopic(){
    try {
      const masterTopicTx: TransactionResponse = await new TopicCreateTransaction().execute(this.client);
      const masterReceipt: TransactionReceipt = await masterTopicTx.getReceipt(this.client)
      console.log(masterReceipt);
      console.log(masterReceipt.topicId);
      return masterReceipt.toJSON();
    } catch (error) {
      return JSON.stringify(error)
    }
  }
}
