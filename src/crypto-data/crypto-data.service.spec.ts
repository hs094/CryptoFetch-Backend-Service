import { Test, TestingModule } from '@nestjs/testing';
import { CryptoDataService } from './crypto-data.service';

describe('CryptoDataService', () => {
  let service: CryptoDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoDataService],
    }).compile();

    service = module.get<CryptoDataService>(CryptoDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
