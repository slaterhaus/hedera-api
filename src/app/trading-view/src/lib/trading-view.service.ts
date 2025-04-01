import { Injectable } from '@nestjs/common';

export interface Payload {
  action: string;
  symbol: string;
  quantity: number;
}

@Injectable()
export class TradingViewService {
  handleWebook(payload: Payload) {}
}
