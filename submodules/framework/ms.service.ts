import { HttpStatus } from "@nestjs/common";
import { ClassConstructor, plainToClass, plainToInstance } from "class-transformer";
import QueryCondition from "submodules/Dto/QueryContion.dto";
import RequestModel from "submodules/Dto/requestModel";
import RequestModelQuery from "submodules/Dto/requestModelQuert";
import ResponseModel from "submodules/Dto/responseModel";
import ResponseModelQueryDto from "submodules/Dto/responseModelQuery.dto";
import { Broker } from "submodules/rabbitmq-broker/broker";
import { DeepPartial, Repository, SelectQueryBuilder } from "typeorm";


enum ResponseMessage {
    SUCCESS = 'Successfully processed the request. ',
    FAILED = 'Error occured while interacting with database. '
}


export default class MicroService<TEntity,TDto>{
    private genericRepository : Repository<TEntity>;
    private rationalMappingFields : Array<string & keyof TDto>
    private entityClassConstructor : ClassConstructor<DeepPartial<TEntity>>;
    private responseModelClassConstructor : ClassConstructor<TDto>;
    private entityName: string;
    constructor(
        genericRepository:Repository<TEntity>,
        rationalMappingFields : Array<string & keyof TDto>,
        entityClassConstructor: ClassConstructor<DeepPartial<TEntity>>,
        responseModelClasConstructor : ClassConstructor<TDto>,
        entityName: string
    ){
        this.genericRepository = genericRepository;
        this.rationalMappingFields = rationalMappingFields
        this.entityClassConstructor = entityClassConstructor
        this.responseModelClassConstructor = responseModelClasConstructor
        this.entityName = entityName
    }

    private getMappedObject(data: TDto): DeepPartial<TEntity> {
        for (let key of this.rationalMappingFields) {
            if (data[key]) {//data[key]
                let map: any;
                if (Array.isArray(data[key])) {
                    let ids = <unknown>data[key];//ids = deparments[1,5,3]
                    const idss = <Array<number | string>>ids;
                    map = []
                    for (let id of idss) {
                        map.push({ id });
                    }
                } else {
                    map = { id: data[key] };
                }
                data[key] = map;
            }
        }
    return plainToInstance(this.entityClassConstructor,data)
    }

    async getAll():Promise<ResponseModel<TDto[]>>{
        try {
            const data : TEntity[] = await this.genericRepository.find()
            return new ResponseModel<TDto[]>(HttpStatus.OK,'SUCCESS','GET',ResponseMessage.SUCCESS, plainToInstance(this.responseModelClassConstructor,data))
        } catch (error) {
            return new ResponseModel<TDto[]>(HttpStatus.INTERNAL_SERVER_ERROR, 'FAILED', 'GET', ResponseMessage.FAILED + error.message, null);
        }
    }

    async getById(id : number | string): Promise<ResponseModel<TDto>>{
        try {
            const data : TEntity = await this.genericRepository.findOne(id);
            return new ResponseModel(HttpStatus.OK,'SUCCESS','GET',ResponseMessage.SUCCESS, plainToInstance(this.responseModelClassConstructor,data))
        } catch (error) {
            return new ResponseModel<TDto>(HttpStatus.INTERNAL_SERVER_ERROR, 'FAILED', 'GET', ResponseMessage.FAILED + error.message, null);
        }
    }

    async create(req: RequestModel<TDto>): Promise<ResponseModel<TDto>> {
        try {
            const body:DeepPartial<TEntity> = this.getMappedObject(req.data);
            // const object: DeepPartial<TEntity> = this.genericRepository.create(body);
            const createdObject: TEntity = await this.genericRepository.save(plainToInstance(this.entityClassConstructor,body));
            const res = new ResponseModel<TDto>(HttpStatus.CREATED, 'SUCCESS', 'POST', ResponseMessage.SUCCESS + `Created ${this.entityName} successfully`, plainToInstance(this.responseModelClassConstructor, createdObject));
            return res
        } catch (error) {
            console.log(error);
            const res = new ResponseModel<TDto>(HttpStatus.INTERNAL_SERVER_ERROR, 'FAILED', 'POST', ResponseMessage.FAILED + error.message, null);
            return res;
        }
    }

    async update(req: RequestModel<TDto>): Promise<ResponseModel<TDto>>{
        try {
            const id = req.data['id'];
            if (id) {
                const object = await this.genericRepository.findOneOrFail(id);
                const body: DeepPartial<TEntity> = this.getMappedObject(req.data);
                const newObject: TEntity = { ...object, ...body }
                const updatedObject: TEntity = await this.genericRepository.save(plainToInstance(this.entityClassConstructor, newObject));
                const res = new ResponseModel<TDto>(HttpStatus.OK, 'SUCCESS', 'PUT', ResponseMessage.SUCCESS + `Updated ${this.entityName} with id: ${id} successfully`, plainToInstance(this.responseModelClassConstructor, updatedObject));
                return res;
            }
            else {
                const res = new ResponseModel<TDto>(HttpStatus.BAD_REQUEST, 'FAILED', 'PUT', ResponseMessage.FAILED + `Unable to find ${this.entityName} with id: ${id}.`, null);
                return res;
            }
        } catch (error) {
            const res = new ResponseModel<TDto>(HttpStatus.INTERNAL_SERVER_ERROR, 'FAILED', 'PUT', ResponseMessage.FAILED + error.message, null);
            return res;
        }
    }

    async delete(id: number | string): Promise<any> {
        try {
            const object: TEntity = await this.genericRepository.findOneOrFail(id);
            const deletedObject: TEntity = await this.genericRepository.remove(object);
            const res = new ResponseModel<TDto>(HttpStatus.OK, 'SUCCESS', 'DELETE', `Deleted ${this.entityName} with id: ${id}`, plainToInstance(this.responseModelClassConstructor, deletedObject));
            return res;
        } catch (error) {
            const res = new ResponseModel<TDto>(HttpStatus.INTERNAL_SERVER_ERROR, 'FAILED', 'DELETE', ResponseMessage.FAILED + error.message, null);
            return res;
        }
    }

    private conditionalQueryBuilder(queryBuild : SelectQueryBuilder<TEntity>, conditions: QueryCondition[], search:string):SelectQueryBuilder<TEntity>{
        if(search !== ''){
            for(let condition of conditions){
                const columnName = condition.columnName
                condition.columnName === 'number' ? queryBuild.orWhere(`object.${columnName}::text LIKE :search`, { search: `%${search}%` }) :  queryBuild.orWhere(`object.${columnName} ILIKE :search`, { search: `%${search}%` })
            }
        }
        return queryBuild
    }

    private leftJoinChildren(queryBuild:SelectQueryBuilder<TEntity>, children : string[]): SelectQueryBuilder<TEntity>{
        for(let child of children){
            queryBuild.leftJoinAndSelect('object.' + child,child)
        }
        return queryBuild
    }

    async queryFilter(body: RequestModelQuery): Promise<ResponseModel<ResponseModelQueryDto<TDto[]>>> {
        const pazeSize = body.filter.page.pageSize;
        const offset = (body.filter.page.pageNumber - 1) * pazeSize;
        const search = body.filter.searchTerm;  
        try {
            let queryBuild: SelectQueryBuilder<TEntity> = this.genericRepository
                .createQueryBuilder('object')
            queryBuild = this.conditionalQueryBuilder(queryBuild, body.filter.conditions, search)
                .orderBy('object.' + body.filter.orderByField, body.filter.orderBy)
            const entityCount: number = await queryBuild.getCount();
            queryBuild
                .offset(offset)
                .limit(pazeSize)
            const data: TEntity[] = await this.leftJoinChildren(queryBuild, body.children)
                .getMany();
            console.log(data, entityCount);
            const responeData: ResponseModelQueryDto<TDto[]> = {
                count: entityCount,
                list: plainToInstance(this.responseModelClassConstructor, data)
            }
            return new ResponseModel<ResponseModelQueryDto<TDto[]>>(HttpStatus.OK, 'SUCCESS', 'GET', ResponseMessage.SUCCESS, responeData);
        } catch (error) {
            console.log(error);
            return new ResponseModel<ResponseModelQueryDto<TDto[]>>(HttpStatus.INTERNAL_SERVER_ERROR, 'FAILED', 'GET', ResponseMessage.FAILED + error.message, null);
        }
    }
}