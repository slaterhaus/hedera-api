import { Body, Controller, Get, Post } from '@nestjs/common';
import { Payload, TradingViewService } from './trading-view.service';

@Controller('trading-view')
export class TradingViewController {
  constructor(private tradingViewService: TradingViewService) {}

  @Post()
  handleWebhook(@Body() payload: Payload): any {
    this.tradingViewService.handleWebook(payload);
    return payload;
  }
  @Get()
  health() {
    return 200;
  }
}
