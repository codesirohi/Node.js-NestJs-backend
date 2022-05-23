import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DepartmentModule } from './Department/department.module';
import { EmployeeModule } from './Employee/employee.module';

@Module({
  imports: [
  TypeOrmModule.forRoot({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "Civilwar23@#",
    database: "MainProject",
    autoLoadEntities: true,
    synchronize: true
  }), EmployeeModule, DepartmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
