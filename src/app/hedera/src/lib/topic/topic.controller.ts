import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { Client, TopicId, TopicInfoQuery, TopicMessageQuery } from '@hashgraph/sdk';
import { CreateChildTopicDto, TopicResponseDto } from '../types';
import { TopicService } from './topic.service';
import { TransactionReceiptJSON } from '@hashgraph/sdk/lib/transaction/TransactionReceipt';

@Controller('topics')
export class TopicController {
  constructor(
    @Inject('HEDERA_CLIENT')
    private readonly client: Client,
    private readonly topicService: TopicService
  ) {}

  @Get('create-master-topic')
  createMasterTopic() {
    // return this.topicService.createMasterTopic();
  }

  @Get('topic/:topicId')
  async getTopicById(@Param('topicId') topicId: TopicId) {
    try {
      return await new TopicInfoQuery()
        .setTopicId(topicId)
        .execute(this.client);
    } catch (e) {
      return e;
    }
  }
  @Get('children')
  async getChildTopics() {
    // return await this.topicService.getChildTopics();
    // return {'hey': 'hey'}
    return await this.topicService.getChildTopics();
  }

  @Post('child')
  async createChildTopic(
    @Body() createTopicDto: CreateChildTopicDto
  ): Promise<TransactionReceiptJSON> {
    return this.topicService.createChildTopic(createTopicDto.memo)
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
