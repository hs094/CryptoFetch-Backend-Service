import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { StatsController } from './controller/stats.controller';
import { DeviationController } from './controller/deviation.controller';
import { AppService } from './app.service';
import { CryptoDataModule } from './crypto-data/crypto-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config accessible globally
      envFilePath: '.env', // Specify the path to your .env file
    }), // Load .env file

    // Configuring MongoDB Connection and ScheduleModule
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const appService = new AppService(configService);
        return {
          uri: appService.getMongoURI(),
        };
      },
    }),
    ScheduleModule.forRoot(),
    CryptoDataModule,
  ],
  controllers: [AppController, StatsController, DeviationController],
  providers: [AppService],
})
export class AppModule {}
