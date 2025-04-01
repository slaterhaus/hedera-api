import { Test } from '@nestjs/testing';
import { TradingViewService } from './trading-view.service';

describe('TradingViewService', () => {
  let service: TradingViewService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TradingViewService],
    }).compile();

    service = module.get(TradingViewService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
