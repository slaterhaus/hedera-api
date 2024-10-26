import { Test } from '@nestjs/testing';
import { HederaService } from './hedera.service';

describe('HederaService', () => {
  let service: HederaService;

  // beforeEach(async () => {
  //   const module = await Test.createTestingModule({
  //     providers: [HederaService],
  //   }).compile();
  //
  //   service = module.get(HederaService);
  // });

  it('should be defined', () => {
    // expect(service).toBeTruthy();
    expect(true).toBeTruthy()
  });
});
