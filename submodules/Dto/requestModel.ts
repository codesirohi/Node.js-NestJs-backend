export default class RequestModel<TDto> {
    socketId: string = null;
    requestId: string = null;
    data?: TDto;
}