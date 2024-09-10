import { Body, Controller, Get, Path, Post, Route, Security, Response } from 'tsoa';
import { RequestService } from './requestService';
import { Request as ExpressRequest } from 'express';

@Route('api/v0/request')
export class RequestController extends Controller {
    private requestService = new RequestService();

    @Get()
    @Security("jwt", ["member"])
    public async getFriendRequests(@Request() request: ExpressRequest): Promise<Array<{id: string, name: string}>> {
        return await this.requestService.getFriendRequests(request.user.id);
    }

    @Post('{memberId}')
    @Security("jwt", ["member"])
    public async acceptFriendRequest(@Path() memberId: string, @Request() request: ExpressRequest): Promise<{id: string, name: string}> {
        return await this.requestService.acceptFriendRequest(request.user.id, memberId);
    }
}
