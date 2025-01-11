import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { CryptoData } from './schemas/crypto-data.schema';
import axios from 'axios';
import { Model } from 'mongoose';
import Bottleneck from 'bottleneck';

// Create a rate limiter
const limiter = new Bottleneck({
  minTime: 2000, // 2 seconds between requests (30 requests per minute)
});

// Rate-limited API call function
const rateLimitedApiCall = limiter.wrap(async (url: string, params: any) => {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
});

@Injectable()
export class CryptoDataService {
  constructor(
    @InjectModel('CryptoData') private readonly cryptoModel: Model<CryptoData>,
    private readonly configService: ConfigService, // Inject ConfigService
  ) {}
  private readonly logger = new Logger(CryptoDataService.name);
  SUPPORTED_COINS = ['bitcoin', 'matic-network', 'ethereum'];
  apiUrl = `${this.configService.get<string>('COINGECKO_API_URL')}${encodeURIComponent(
    this.configService.get<string>('COINGECKO_API_KEY'),
  )}`;
  async fetchAndSaveCryptoData() {
    try {
      for (const coin of this.SUPPORTED_COINS) {
        const response = await axios.get(this.apiUrl, {
          params: {
            ids: coin,
            vs_currencies: 'usd',
            include_market_cap: true,
            include_24hr_change: true,
            precision: 2,
          },
        });

        const data = response.data[coin];
        if (!data) {
          this.logger.error(`No data found for coin: ${coin}`);
          continue;
        }

        const cryptoData = {
          coinId: coin,
          priceUsd: data.usd,
          marketCapUsd: data.usd_market_cap,
          change24h: data.usd_24h_change,
        };

        await this.cryptoModel.create(cryptoData);
        this.logger.debug(`Data saved for coin: ${coin}`);
      }
    } catch (error) {
      this.logger.error(
        `Error fetching or saving crypto data: ${error.message}`,
      );
    }
  }
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    this.logger.debug('Fetching and Saving Crypto Data');
    await this.fetchAndSaveCryptoData();
  }
  async fetchLatestStats(coinId: string) {
    // Validate coinId
    if (!this.SUPPORTED_COINS.includes(coinId)) {
      this.logger.error(`Unsupported coin requested: ${coinId}`);
      throw new Error(
        `Unsupported coin requested. Supported coins: ${this.SUPPORTED_COINS.join(', ')}`,
      );
    }
  
    try {
      // Make the rate-limited API call
      const data = await rateLimitedApiCall(this.apiUrl, {
        ids: coinId,
        vs_currencies: 'usd',
        include_market_cap: true,
        include_24hr_change: true,
        precision: 2,
      });
  
      // Extract the coin data
      const coinData = data[coinId];
      if (!coinData) {
        this.logger.error(`No data found for coin: ${coinId}`);
        throw new Error(`No data found for coin: ${coinId}`);
      }
  
      // Return the data in the required format
      return {
        price: coinData.usd,
        marketCap: coinData.usd_market_cap,
        '24hChange': coinData.usd_24h_change,
      };
    } catch (error) {
      this.logger.error(`Error fetching latest stats for coin ${coinId}: ${error.message}`);
      throw error;
    }
  }
  

  async calculateDeviation(coinId: string) {
    // Validate coinId
    const SUPPORTED_COINS = ['bitcoin', 'matic-network', 'ethereum'];
    if (!SUPPORTED_COINS.includes(coinId)) {
      this.logger.error(`Unsupported coin requested: ${coinId}`);
      throw new Error(`Unsupported coin requested: ${coinId}`);
    }
    // Fetch the latest 100 records
    const records = await this.cryptoModel
      .find({ coinId }, { sort: { createdAt: -1 }, limit: 100 })
      .select('priceUsd')
      .exec();
    if (!records || records.length === 0) {
      this.logger.error(`No data found for coin: ${coinId}`);
      throw new Error(`No data found for coin: ${coinId}`);
    }
    // Extract prices from the records
    const prices = records.map((record) => record.priceUsd);
    // Calculate standard deviation
    const deviation = this.calculateStdDev(prices);
    return {
      deviation: deviation,
    };
  }

  private calculateStdDev(prices: number[]): number {
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const squaredDifferences = prices.map((price) => (price - mean) ** 2);
    const variance =
      squaredDifferences.reduce((sum, diff) => sum + diff, 0) / prices.length;
    return Math.sqrt(variance);
  }
}
