import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  Client,
  TopicCreateTransaction, TopicMessage, TopicMessageQuery,
  TopicMessageSubmitTransaction,
  TransactionReceipt,
  TransactionResponse
} from '@hashgraph/sdk';
import type { TransactionReceiptJSON } from '@hashgraph/sdk/lib/transaction/TransactionReceipt';
import { ChildTopic, ChildTopicsResponse, MirrorNodeMessage } from '../types';
import axios from 'axios';

@Injectable()
export class TopicService {
  private readonly masterTopicId: string = process.env['MASTER_TOPIC_ID']!
  private readonly mirrorNodeUrl = 'https://testnet.mirrornode.hedera.com'; // or mainnet
  constructor(
    @Inject('HEDERA_CLIENT')
    private readonly client: Client
  ) {}
  async createMasterTopic(){
    try {
      const masterTopicTx: TransactionResponse = await new TopicCreateTransaction().execute(this.client);
      const masterReceipt: TransactionReceipt = await masterTopicTx.getReceipt(this.client)
      return masterReceipt.toJSON();
    } catch (error) {
      return JSON.stringify(error)
    }
  }
  async createChildTopic(childTopicMemo?: string): Promise<TransactionReceiptJSON> {
    const parentTopicId = process.env['MASTER_TOPIC_ID'] as string;
    // Create the child topic
    const childTopicTx = await new TopicCreateTransaction()
      .setTopicMemo(childTopicMemo || "Child Topic")
      .execute(this.client);

    const childReceipt = await childTopicTx.getReceipt(this.client);
    const childTopicId = childReceipt.topicId;

    // Store the relationship in the parent topic
    const relationshipMessage = {
      type: 'CHILD_TOPIC',
      childTopicId: childTopicId?.toString(),
      parentTopicId,
      createdAt: new Date().toISOString(),
      memo: childTopicMemo
    };

    // Submit the relationship to the parent topic
    await new TopicMessageSubmitTransaction()
      .setTopicId(parentTopicId)
      .setMessage(JSON.stringify(relationshipMessage))
      .execute(this.client);

    return childReceipt.toJSON();
  }

  
/*  async getChildTopics(): Promise<ChildTopicsResponse> {
    try {
      const childTopics: ChildTopic[] = [];

      // Query the master topic for child topic messages
      new TopicMessageQuery().setTopicId(this.masterTopicId).subscribe(
        this.client,
        (message: TopicMessage | null) => {

          try {
            const messageContent = message?.contents;
            childTopics.push((message?.contents ?? {}) as ChildTopic);
            // Only include messages that are child topic records
            // if (messageContent?.type === 'CHILD_TOPIC') {
            //   childTopics.push(message?.contents);
            // }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        },
        (error) => {
          console.error('Error subscribing to topic:', error);
        }
      );

      return {
        topics: childTopics,
        count: childTopics.length
      };

    } catch (error: any) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }*/
  async getChildTopics() {
    try {
      const response = await axios.get(
        `${this.mirrorNodeUrl}/api/v1/topics/${this.masterTopicId}/messages`
      );

      const childTopics: ChildTopic[] = response.data.messages
        .map((msg: MirrorNodeMessage) => {
          try {
            // Mirror node returns base64 encoded messages
            const decodedMessage = Buffer.from(msg.message, 'base64').toString();
            const messageContent = JSON.parse(decodedMessage);

            if (messageContent.type === 'CHILD_TOPIC') {
              return {
                childTopicId: messageContent.childTopicId,
                parentTopicId: messageContent.parentTopicId,
                memo: messageContent.memo,
                createdAt: messageContent.createdAt,
                type: messageContent.type
              };
            } else {
              return null;
            }
          } catch (error) {
            console.error('Error parsing message:', error);
            return null;
          }
        })
        .filter(Boolean); // Remove null entries

      return {
        topics: childTopics,
        count: childTopics.length
      };

    } catch (error: any) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
