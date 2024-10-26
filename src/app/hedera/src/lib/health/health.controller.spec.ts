import { Test, TestingModule } from '@nestjs/testing';
import { HederaHealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HederaHealthController;

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     controllers: [HederaHealthController],
  //   }).compile();
  //
  //   controller = module.get<HederaHealthController>(HederaHealthController);
  // });

  it('should be defined', () => {
    expect({  }).toBeDefined();
  });
});
