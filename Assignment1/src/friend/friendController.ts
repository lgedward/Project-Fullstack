import { Controller, Get, Path, Post, Delete, Route, Security, Response, Request } from 'tsoa';
import { FriendService } from './friendService';
import * as express from 'express';

@Route('friend')
export class FriendController extends Controller {
    private friendService = new FriendService();

    @Get()
    @Security("jwt", ["member"])
    @Response('200', 'OK')
    public async getFriends(@Request() request: express.Request): Promise<Array<{id: string, name: string, accepted: boolean}>> {
        if (!request.user) {
            this.setStatus(401); // Unauthorized
            throw new Error("User not authenticated");
        }
        return await this.friendService.getFriends(request.user.email);
    }

    @Post('{memberId}')
    @Security("jwt", ["member"])
    @Response('200', 'OK')
    @Response('404', 'Member not found')
    @Response('409', 'Friend request already sent or member is already a friend')
    public async sendFriendRequest(@Path() memberId: string, @Request() request: express.Request): Promise<{id: string, name: string, accepted: boolean}> {
        if (!request.user) {
            this.setStatus(401); // Unauthorized
            throw new Error("User not authenticated");
        }
        return await this.friendService.sendFriendRequest(request.user.email, memberId);
    }

    @Delete('{memberId}')
    @Security("jwt", ["member"])
    @Response('200', 'Friendship removed')
    @Response('404', 'Member not found')
    public async deleteFriend(@Path() memberId: string, @Request() request: express.Request): Promise<{id: string, name: string, accepted: boolean}> {
        if (!request.user) {
            this.setStatus(401); // Unauthorized
            throw new Error("User not authenticated");
        }
        return await this.friendService.deleteFriend(request.user.email, memberId);
    }
}
