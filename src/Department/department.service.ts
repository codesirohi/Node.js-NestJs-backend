import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DepartmentDto from "submodules/Dto/department.dto";
import DepartmentEntity from "submodules/Entities/departmentEntity";
import MicroService from "submodules/framework/ms.service";
import { Repository } from "typeorm";



@Injectable()
export class DepartmentService extends MicroService<DepartmentEntity,DepartmentDto>{
    constructor(@InjectRepository(DepartmentEntity)
     private readonly DepartmentRepositary: Repository<DepartmentEntity>){
         super(DepartmentRepositary, ['employees'], DepartmentEntity,DepartmentDto, 'department')
     }
}     