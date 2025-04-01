import { Test } from '@nestjs/testing';
import { TradingViewController } from './trading-view.controller';
import { TradingViewService } from './trading-view.service';

describe('TradingViewController', () => {
  let controller: TradingViewController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TradingViewService],
      controllers: [TradingViewController],
    }).compile();

    controller = module.get(TradingViewController);
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });
});
