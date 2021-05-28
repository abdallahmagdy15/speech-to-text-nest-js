import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const cors = require('cors')
  const port = 3000;
  app.use(cors());
  await app.listen(port);
}
bootstrap();
