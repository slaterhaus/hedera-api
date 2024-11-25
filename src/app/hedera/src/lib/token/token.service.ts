import { Inject, Injectable } from '@nestjs/common';

import {
  Client,
  TokenAssociateTransaction,
  TokenCreateTransaction,
  TokenId,
  TokenInfoQuery,
  TransferTransaction,
} from '@hashgraph/sdk';
import {
  CreateTokenDto,
  PropertyToken,
  TransferTokenDto,
} from '../types/token';
import { HederaService } from '@hedera-api/hedera';

@Injectable()
export class TokensService {
  // TODO actual storage solution, maybe topic?
  private tokenStorage: Map<string, PropertyToken> = new Map();

  constructor(
    private readonly hederaService: HederaService,
    @Inject('HEDERA_CLIENT')
    private readonly client: Client
  ) {}

  async createRWAToken(createTokenDto: CreateTokenDto): Promise<PropertyToken> {
    const transaction = new TokenCreateTransaction()
      .setTokenName(createTokenDto.name)
      .setTokenSymbol(createTokenDto.symbol)
      .setDecimals(0)
      .setInitialSupply(createTokenDto.totalSupply)
      .setTreasuryAccountId(this.client.operatorAccountId!)
      .setAdminKey(this.client.operatorPublicKey!)
      .setSupplyKey(this.client.operatorPublicKey!);

    const receipt = await this.hederaService.executeTransaction(transaction);

    const newPropertyToken: PropertyToken = {
      tokenId: receipt.tokenId.toString(),
      name: createTokenDto.name,
      symbol: createTokenDto.symbol,
      propertyAddress: createTokenDto.propertyAddress,
      totalSupply: createTokenDto.totalSupply,
      pricePerToken: createTokenDto.pricePerToken,
      holders: new Map<any, number>([
        [this.client.operatorAccountId, createTokenDto.totalSupply],
      ]),
      metadata: createTokenDto.metadata,
      createdAt: new Date(),
    };

    this.tokenStorage.set(newPropertyToken.tokenId, newPropertyToken);
    return newPropertyToken;
  }

  async transferTokens(params: TransferTokenDto): Promise<PropertyToken> {
    const transaction = new TransferTransaction()
      .addTokenTransfer(
        TokenId.fromString(params.tokenId),
        params.fromAccountId,
        -params.amount
      )
      .addTokenTransfer(
        TokenId.fromString(params.tokenId),
        params.toAccountId,
        params.amount
      );

    await this.hederaService.executeTransaction(transaction);

    const token = this.tokenStorage.get(params.tokenId);
    if (!token) {
      throw new Error('Token not found');
    }

    const fromAmount = token.holders.get(params.fromAccountId) || 0;
    const toAmount = token.holders.get(params.toAccountId) || 0;

    token.holders.set(params.fromAccountId, fromAmount - params.amount);
    token.holders.set(params.toAccountId, toAmount + params.amount);

    this.tokenStorage.set(params.tokenId, token);
    return token;
  }

  async getTokenInfo(
    tokenId: string
  ): Promise<PropertyToken & { onChainInfo: any }> {
    const client = await this.hederaService.getClient();
    const query = new TokenInfoQuery().setTokenId(TokenId.fromString(tokenId));

    const [onChainInfo, storedToken] = await Promise.all([
      query.execute(client),
      this.tokenStorage.get(tokenId),
    ]);

    if (!storedToken) {
      throw new Error('Token not found');
    }

    return {
      ...storedToken,
      onChainInfo,
    };
  }

  async associateTokenToAccount(
    accountId: string,
    tokenId: string
  ): Promise<void> {
    const transaction = new TokenAssociateTransaction()
      .setAccountId(accountId)
      .setTokenIds([TokenId.fromString(tokenId)]);

    await this.hederaService.executeTransaction(transaction);
  }

  async getAllTokens(): Promise<PropertyToken[]> {
    return Array.from(this.tokenStorage.values());
  }

  async getTokensByAddress(propertyAddress: string): Promise<PropertyToken[]> {
    return Array.from(this.tokenStorage.values()).filter(
      (token) => token.propertyAddress === propertyAddress
    );
  }
}
