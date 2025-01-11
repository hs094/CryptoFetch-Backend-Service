import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  getInfo(): string {
    return 'This is a Backend Server that will fetch latest crypto prices and give statics and deviations based on them.';
  }
  constructor(private readonly configService: ConfigService) {}

  getMongoURI(): string {
    const username = this.configService.get<string>('MONGO_USERNAME');
    const password = encodeURIComponent(this.configService.get<string>('MONGO_PASSWORD'));
    const database = encodeURIComponent(this.configService.get<string>('MONGO_DATABASE'));
    return `mongodb+srv://${username}:${password}@${database}.8q2cn.mongodb.net/?retryWrites=true&w=majority`;
  }
}
