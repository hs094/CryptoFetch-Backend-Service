import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CryptoDataService } from './crypto-data/crypto-data.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo(): string {
    return this.appService.getInfo();
  }
}