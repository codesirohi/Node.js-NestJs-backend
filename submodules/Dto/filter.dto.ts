import PaginationDto from "./pagination.dto";
import QueryCondition from "./QueryContion.dto";

export default class FilterDto {
    orderBy: 'ASC' | 'DESC';
    orderByField: string;
    searchTerm: string;
    conditions: Array<QueryCondition>;
    page: PaginationDto;

    constructor(
        orderBy: 'ASC' | 'DESC' = 'ASC',
        conditions: Array<QueryCondition> = [],
        page: PaginationDto = new PaginationDto,
        orderByField: string = 'id',
        searchTerm: string = ''
    ) {
        this.orderBy = 'ASC';
        this.page = page;
        this.conditions = conditions;
        this.orderByField = orderByField;
        this.searchTerm = searchTerm;
    }
}