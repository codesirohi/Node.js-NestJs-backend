import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT =  3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.setGlobalPrefix('api') //not compulsory
  await app.listen(PORT, ()=>{
    console.log("Microservice Running on Port " + PORT)
  });
}
bootstrap();
