import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { AppConfigService } from 'src/config/app-config.service';
import { configEnvKeys } from 'src/config/consts';

@Injectable()
export class DbRunner {
  private mongoUri: string;

  private dbName: string;

  constructor(private appConfigService: AppConfigService) {
    this.mongoUri = this.appConfigService.getEnv(
      configEnvKeys.mongoURI,
    ) as string;
    this.dbName = this.appConfigService.getEnv(
      configEnvKeys.mongoDBName,
    ) as string;
  }

  async runDb() {
    try {
      await mongoose.connect(this.mongoUri, { dbName: this.dbName });

      console.log('Connected successfully to mongo server');
    } catch {
      console.log("Can't connect to db");
      // Ensures that the client will close when you finish/error
      await mongoose.disconnect();
    }
  }
}
