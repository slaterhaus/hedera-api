import { Controller, Get, Inject, Param } from '@nestjs/common';
import { Client, TopicId, TopicInfoQuery } from '@hashgraph/sdk';

@Controller('topic')
export class TopicController {
  constructor(
    @Inject('HEDERA_CLIENT')
    private readonly client: Client
  ) {}

  @Get('create-master-topic')
  createMasterTopic() {
    // return this.topicService.createMasterTopic();
  }

  @Get(':topicId')
  async getTopicById(@Param('topicId') topicId: TopicId) {
    try {
      return await new TopicInfoQuery()
        .setTopicId(topicId)
        .execute(this.client);
    } catch (e) {
      return e;
    }
  }
}

/**
 * {
 *   "status": "SUCCESS",
 *   "accountId": null,
 *   "filedId": null,
 *   "contractId": null,
 *   "topicId": "0.0.5037527",
 *   "tokenId": null,
 *   "scheduleId": null,
 *   "exchangeRate": {
 *     "hbars": 30000,
 *     "cents": 147333,
 *     "expirationTime": "2024-10-27T20:00:00.000Z",
 *     "exchangeRateInCents": 4.9111
 *   },
 *   "topicSequenceNumber": "0",
 *   "topicRunningHash": "",
 *   "totalSupply": "0",
 *   "scheduledTransactionId": null,
 *   "serials": [],
 *   "duplicates": [],
 *   "children": [],
 *   "nodeId": "0"
 * }
 */
