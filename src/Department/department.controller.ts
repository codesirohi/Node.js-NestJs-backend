import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import DepartmentDto from "submodules/Dto/department.dto";
import RequestModel from "submodules/Dto/requestModel";
import RequestModelQuery from "submodules/Dto/requestModelQuert";
import ResponseModel from "submodules/Dto/responseModel";
import ResponseModelQueryDto from "submodules/Dto/responseModelQuery.dto";
import { Broker } from "submodules/rabbitmq-broker/broker";
import { DepartmentService } from "./department.service";


@Controller('DEPARTMENT')
export class DepartmentController{
    private broker = Broker.getInstance();
    // mention the topic we need for this controller
    private topicArray = ['DEPARTMENT_ADD', 'DEPARTMENT_UPDATE', 'DEPARTMENT_DELETE'];
    private serviceName = ['IOT_SERVICE', 'IOT_SERVICE', 'IOT_SERVICE'];

    constructor(private readonly departmentService: DepartmentService) {
        // starting to listen for respective topics
        this.moduleInit();
    }

    /**
     * creating a listener to all topic belong to this controller
     */

    async moduleInit() {
        console.log('inside of Department Controller for connection');
        for (var i = 0; i < this.topicArray.length; i++) {
            this.broker.listenToService(
                this.topicArray[i],
                this.serviceName[i],
                (() => {
                    var value = this.topicArray[i];
                    return async (result) => {
                        console.log('params passed to listner callback in MS........' + JSON.stringify(result));
                        let responseModelOfGroupDto: ResponseModel<DepartmentDto>;
                        try {
                            switch (value) {
                                case 'DEPARTMENT_ADD':
                                    console.log('Inside DEPARTMENT_ADD Topic');
                                    responseModelOfGroupDto = await this.create(result['message']);
                                    break;
                                case 'DEPARTMENT_UPDATE':
                                    console.log('Inside DEPARTMENT_UPDATE Topic');
                                    var id = result.message.data.id;
                                    responseModelOfGroupDto = await this.update(result['message']);
                                    break;
                                case 'DEPARTMENT_DELETE':
                                    console.log('Inside DEPARTMENT_DELETE Topic');
                                    var id = result.message.data.id;
                                    responseModelOfGroupDto = await this.delete(parseInt(id));
                                    break;
                            }
                            responseModelOfGroupDto.socketId = result.message.socketId;
                            responseModelOfGroupDto.requestId = result.message.requestId;
                            console.log(responseModelOfGroupDto);
                            console.log('Sending process data back to gateways...');
                            for (
                                let index = 0;
                                index < result.OnSuccessTopicsToPush.length;
                                index++
                            ) {
                                const element = result.OnSuccessTopicsToPush[index];
                                this.broker.PublicMessageToTopic(
                                    element,
                                    responseModelOfGroupDto,
                                );
                            }
                        } catch (error) {
                            console.log('Error occured when trying to listen queues...');
                            console.log(error, result);
                            for (
                                let index = 0;
                                index < result.OnFailureTopicsToPush.length;
                                index++
                            ) {
                                const element = result.OnFailureTopicsToPush[index];
                                this.broker.PublicMessageToTopic(
                                    element,
                                    responseModelOfGroupDto
                                );
                            }
                        }
                    };
                })(),
            );
        }
    }




    @Get()
    async queryFilter(
        @Query('query') query: string
    ): Promise<ResponseModel<ResponseModelQueryDto<DepartmentDto[]>>> {
        const body: RequestModelQuery = JSON.parse(query);
        console.log(body);
        return this.departmentService.queryFilter(body);
    }

    @Get(':id')
    async getById(
        @Param('id') id: number
    ): Promise<ResponseModel<DepartmentDto>> {
        return this.departmentService.getById(id);
    }

    @Post()
    async create(
        @Body() body: RequestModel<DepartmentDto>
    ): Promise<ResponseModel<DepartmentDto>> {
        return this.departmentService.create(body);
    }

    @Put()
    async update(
        @Body() body: RequestModel<DepartmentDto>
    ): Promise<ResponseModel<DepartmentDto>> {
        return this.departmentService.update(body);
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number
    ): Promise<ResponseModel<DepartmentDto>> {
        return this.departmentService.delete(id);
    }
}