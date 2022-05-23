import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import DepartmentEntity from "submodules/Entities/departmentEntity";
import { DepartmentController } from "./department.controller";
import { DepartmentService } from "./department.service";



@Module({
    imports: [TypeOrmModule.forFeature([DepartmentEntity])],
    controllers: [DepartmentController],
    providers: [DepartmentService]
})

export class DepartmentModule{}