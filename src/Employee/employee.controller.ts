import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import EmployeeDto from "submodules/Dto/employee.dto";
import RequestModel from "submodules/Dto/requestModel";
import RequestModelQuery from "submodules/Dto/requestModelQuert";
import ResponseModel from "submodules/Dto/responseModel";
import ResponseModelQueryDto from "submodules/Dto/responseModelQuery.dto";
import { Broker } from "submodules/rabbitmq-broker/broker";
import { EmployeeService } from "./employee.service";



@Controller('EMPLOYEE')
export class EmployeeController{

    private broker = Broker.getInstance();
    //Topics We need for the controller
    private topicArray = ["EMPLOYEE_ADD","EMPLOYEE_UPDATE","EMPLOYEE_DELETE"];
    private serviceName = ["IOT_SERVICE","IOT_SERVICE","IOT_SERVICE"]

    constructor(private employeeService: EmployeeService){
        this.module_init()
    }


    async module_init(){
        console.log("inside Employee Controller for the connection");
        for(var i=0; i<this.topicArray.length;i++){
            this.broker.listenToService(this.topicArray[i],this.serviceName[i],(()=>{
                var value = this.topicArray[i];
                return async(result)=>{
                    console.log("Params passed to listener callback in MS " + JSON.stringify(result))
                    let responseModelwithDto : ResponseModel<EmployeeDto>
                    try {
                        switch(value){
                            case 'EMPLOYEE_ADD':
                                console.log("inside Employye Add Topic")
                                responseModelwithDto = await this.create(result['message'])
                                break
                            case 'EMPLOYEE_UPDATE':
                                console.log("Inside Employee_Update Topic")
                                var id : string = result.message.data.id
                                responseModelwithDto =  await this.update(result['message'])
                                break
                            case 'EMPLOYEE_DELETE':
                                console.log("Inside Employee Delete Topic")
                                var id : string = result.message.data.id
                                responseModelwithDto = await this.delete(parseInt(id))  
                                break      
                        }
                        responseModelwithDto.socketId = result.message.socketId;
                        responseModelwithDto.requestId = result.message.requestId;
                        console.log(responseModelwithDto)
                        console.log("Sending data back to Api Gateway");
                        for(var i=0; i<result.OnSuccessTopicsToPush.length; i++){
                            const topicName = result.OnSuccessTopicsToPush[i]
                            this.broker.PublicMessageToTopic(topicName,responseModelwithDto);
                        }
                    } catch (error) {
                        console.log("Error Occured while listening to queues");
                        console.log(error, result)
                        for(var i=0; i<result.OnFailureTopicsToPush.length;i++){
                            const topicName = result.OnFailureTopicsToPush[i]
                            this.broker.PublicMessageToTopic(topicName,responseModelwithDto);
                        }
                    }
                }
            })())
        }
    }

    //Normal Crud Operations

    @Get()
    async queryFilter(
        @Query('query') query: string
    ): Promise<ResponseModel<ResponseModelQueryDto<EmployeeDto[]>>> {
        const body: RequestModelQuery = JSON.parse(query);
        console.log(body);
        return this.employeeService.queryFilter(body);
    }

    @Post()
    async create(
        @Body() body: RequestModel<EmployeeDto>
    ): Promise<ResponseModel<EmployeeDto>> {
        return this.employeeService.create(body);
    }

    @Put()
    async update(
        @Body() body: RequestModel<EmployeeDto>
    ): Promise<ResponseModel<EmployeeDto>> {
        return this.employeeService.update(body);
    }

    @Delete(':id')
    async delete(
        @Param('id') id: number
    ): Promise<ResponseModel<EmployeeDto>> {
        return this.employeeService.delete(id);
    }
    
}