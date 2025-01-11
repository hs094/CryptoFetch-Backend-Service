import { Body, Controller, Post } from '@nestjs/common';
import { CryptoDataService } from '../crypto-data.service';
import { Logger } from '@nestjs/common';

@Controller('deviation')
export class DeviationController {
  constructor(private readonly cryptoDataService: CryptoDataService) {}
  private readonly logger = new Logger(DeviationController.name);
  
  @Post()
  async getDeviation(@Body('coin') coin?: string) {
    if (!coin) {
      this.logger.error('Coin parameter is missing, defaulting to "bitcoin"');
      coin = 'bitcoin'; // Default to 'bitcoin'
    }
    return await this.cryptoDataService.calculateDeviation(coin);
  }
}