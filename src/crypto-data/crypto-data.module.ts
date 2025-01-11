import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptoDataService } from './crypto-data.service';
import { CryptoSchema } from './schemas/crypto-data.schema';

@Module({
  imports: [
    ConfigModule.forRoot(), // Load .env file
    MongooseModule.forFeature([{ name: 'CryptoData', schema: CryptoSchema}]),
  ],
  providers: [CryptoDataService],
  exports: [CryptoDataService],
})
export class CryptoDataModule {}
