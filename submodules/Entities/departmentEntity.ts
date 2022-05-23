import { Column, Entity, ManyToMany } from "typeorm";
import EntityBase from "./baseEntity";
import EmployeeEntity from "./employeeEntity";


@Entity('department')
export default class DepartmentEntity extends EntityBase{

    @ManyToMany(() => EmployeeEntity, employee => employee.departments)
    employees: EmployeeEntity[];
}