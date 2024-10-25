import { Test, TestingModule } from '@nestjs/testing';
import { HederaSecurityProvider } from './hedera-security';

describe('HederaSecurity', () => {
  let provider: HederaSecurityProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HederaSecurityProvider],
    }).compile();

    provider = module.get<HederaSecurityProvider>(HederaSecurityProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
