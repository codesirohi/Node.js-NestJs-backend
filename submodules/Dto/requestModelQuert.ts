import FilterDto from "./filter.dto";

export default class RequestModelQuery {
    requestGuid: string;
    children: string[] = [];
    filter: FilterDto = new FilterDto;
}