import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
} from '@hashgraph/sdk';
import { CreateIdentityDto, LoginDto, UserIdentity } from '../types/identity';
import { HederaService } from '@hedera-api/hedera';

@Injectable()
export class IdentityService {
  private didTopicId = 'temp_value';
  constructor(
    private readonly hederaService: HederaService,
    private readonly jwtService: JwtService
  ) {}

  async createIdentity(createIdentityDto: CreateIdentityDto): Promise<string> {
    const client = await this.hederaService.getClient();

    const privateKey = PrivateKey.generateED25519();
    const publicKey = privateKey.publicKey;
    const did = `did:hedera:testnet:${publicKey.toString()}`;

    const topicTx = new TopicCreateTransaction()
      .setAdminKey(client.operatorPublicKey!)
      .setSubmitKey(publicKey)
      .setTopicMemo('user-identity');

    const topicReceipt = await this.hederaService.executeTransaction(topicTx);
    const topicId = topicReceipt.topicId;

    const didDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      verificationMethod: [
        {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2018',
          controller: did,
          publicKeyBase58: publicKey.toString(),
        },
      ],
      authentication: [`${did}#key-1`],
      created: new Date().toISOString(),
    };

    const messageTx = new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(JSON.stringify(didDocument));

    await this.hederaService.executeTransaction(messageTx);

    return this.jwtService.sign({
      did,
      email: createIdentityDto.email,
    });
  }

  async verifyIdentity(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }

  async updateIdentity(
    token: string,
    updates: Partial<UserIdentity>
  ): Promise<string> {
    const payload = await this.verifyIdentity(token);
    if (!payload) {
      throw new Error('Invalid token');
    }

    return this.jwtService.sign({
      ...payload,
      ...updates,
    });
  }

  async login(loginDto: LoginDto): Promise<string> {
    const topicMessage = await this.queryDIDFromHedera(loginDto.email);

    if (!topicMessage) {
      throw new UnauthorizedException('User not found');
    }

    const didDocument = JSON.parse(topicMessage);

    // Generate new JWT token
    return this.jwtService.sign({
      did: didDocument.id,
      email: loginDto.email,
    });
  }

  async queryDIDFromHedera(email: string): Promise<string | null> {
    const client = await this.hederaService.getClient();

    return new Promise((resolve) => {
      const cleanup = (result: string | null) => {
        query.unsubscribe();
        resolve(result);
      };

      const query = new TopicMessageQuery()
        .setTopicId(this.didTopicId)
        .subscribe(
          client,
          (message) => {
            try {
              const contents = message?.contents ?? '{}';
              const messageData = JSON.parse(contents.toString());
              cleanup(messageData);
            } catch (error) {
              cleanup(null);
            }
          },
          (error) => {
            console.error('Subscription error:', error);
            cleanup(null);
          }
        );

      setTimeout(() => cleanup(null), 10e3);
    });
  }
}
