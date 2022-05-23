import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { from, Observable } from "rxjs";
import EmployeeDto from "submodules/Dto/employee.dto";
import EmployeeEntity from "submodules/Entities/employeeEntity";
import MicroService from "submodules/framework/ms.service";
import { DeleteResult, Repository, UpdateResult } from "typeorm";



@Injectable()
export class EmployeeService extends MicroService<EmployeeEntity,EmployeeDto>{
    constructor(@InjectRepository(EmployeeEntity)
     private readonly EmployeeRepositary: Repository<EmployeeEntity>){
         super(EmployeeRepositary, ['departments'], EmployeeEntity,EmployeeDto, 'Employee')
     }

    // createEmployee(employee: Employee): Observable <Employee>{
    //     return from(this.EmployeeRepositary.save(employee))
    // }

    // findAllEmployees():Observable<Employee[]>{
    //     return from(this.EmployeeRepositary.find())
    // }

    // findEmployee(id:number):Observable<Employee>{
    //     return from(this.EmployeeRepositary.findOne(id))
    // }

    // updateEmployee(id:number, employee: Employee):Observable<UpdateResult>{
    //     return from(this.EmployeeRepositary.update(id, employee))
    // }

    // deleteEmployee(id:number):Observable<DeleteResult>{
    //     return from(this.EmployeeRepositary.delete(id))
    // }
}