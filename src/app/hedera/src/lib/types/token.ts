export interface PropertyToken {
  tokenId: string;
  name: string;
  symbol: string;
  propertyAddress: string;
  totalSupply: number;
  pricePerToken: number;
  holders: Map<string, number>;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// tokens/interfaces/token-dto.ts
export interface CreateTokenDto {
  name: string;
  symbol: string;
  totalSupply: number;
  propertyAddress: string;
  pricePerToken: number;
  metadata?: Record<string, any>;
}

export interface TransferTokenDto {
  tokenId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}