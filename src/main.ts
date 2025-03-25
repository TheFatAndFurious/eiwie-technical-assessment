import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Logger} from "@nestjs/common";
import {Connection} from "mongoose";
import {getConnectionToken} from "@nestjs/mongoose";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('bootstrap');


  // Checking if there is a database connection
  const mongooseConnection: Connection = app.get<Connection>(getConnectionToken());
  try {
    await mongooseConnection.asPromise();
    logger.log('Connected to DB');
  } catch (error) {
    logger.error(error);
  }

  await app.listen(process.env.PORT ?? 3001);

}
bootstrap();
