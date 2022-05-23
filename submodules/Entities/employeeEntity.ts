import { Column, Entity, JoinTable, ManyToMany } from "typeorm";
import EntityBase from "./baseEntity";
import DepartmentEntity from "./departmentEntity";


@Entity('employee')
export default class EmployeeEntity extends EntityBase{

    @Column()
    age:number;

    @ManyToMany(() => DepartmentEntity, department => department.employees, { cascade: true, eager: true })
    @JoinTable({ name: "department-employee" })
    departments: DepartmentEntity[];
}