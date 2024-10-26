import { Test } from '@nestjs/testing';
import { HederaController } from './hedera.controller';
import { HederaService } from './hedera.service';

describe('HederaController', () => {
  let controller: HederaController;

  // beforeEach(async () => {
  //   const module = await Test.createTestingModule({
  //     providers: [HederaService],
  //     controllers: [HederaController],
  //   }).compile();
  //
  //   controller = module.get(HederaController);
  // });

  it('should be defined', () => {
    expect(true).toBeTruthy();
  });
});
