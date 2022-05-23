# MICROSERVICE
## Two service are there one HR(direct get call) and IOT(using Queues)



<!-- hoe i created it -->
## Load Submodules into working directory :

  ### Setup Rabbitmq Configuration :
    - This configuration is independent of this project, so we can create different project for this configuration then pull to submodules.
    - Create a different topic for exchanges, should be unique for each topic.
    - Crate a general purpose class `Broker` for:
      - Initiate all exchanges required by `exchanges.ts`.
      - Publish to a queue.
      - Listen to queue.

  ### Import entities, Dtos, Mapping, FrameWork :
    - entities contains Department and Employee entities.
    - Dto contains ResponseDto, DepartmentDto, EmployeeDto.
    - Mapping contains logical mappings for creating DepartmentEmployeeService from BasicMicroservice(generic).
    - Framework contain basic entity and BasicMicroservice(generic).

## Setup Postgres Conection with `AppModule` :
  - Create migrations before running the microservice.

## Create Controller :
  - Employee conroller :
    - Create a function `moduleInit` to start listening to all Employee controller queues.
    - And call the `moduleInit` in constructor.
    - Create CURD operation for Employee.
  - Department controller : same as Employee controller.

## Crate Service :
  - Create service for both Employee and Department.

## Craete Module :
  - create module for Employee and Department and register in `App.module`
