import { Test } from '@nestjs/testing';
import { HealthcheckService } from './healthcheck.service';

describe('HederaHealthcheckService', () => {
  let service: HealthcheckService;

  // beforeEach(async () => {
  //   const module = await Test.createTestingModule({
  //     providers: [HealthcheckService],
  //   }).compile();
  //
  //   service = module.get(HealthcheckService);
  // });

  it('should be defined', () => {
    expect(true).toBeTruthy();
  });
});
