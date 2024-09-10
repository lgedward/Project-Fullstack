import { Controller, Get, Path, Query, Body, Post, Delete, Route, Security, Response, Request } from 'tsoa';
import * as express from 'express';
import { PostService } from './postService';
import * as jwt from "jsonwebtoken";

@Route('post')
export class PostController extends Controller {
    private postService = new PostService();

    @Post()
    @Security("jwt", ["member"])
    public async createPost(@Body() content: { content: string, image: string }, @Request() request: express.Request): Promise<{id: string, member: string, posted: Date, content: string, image: string}> {
        const userId = this.extractUserId(request);
        if (!userId) {
            this.setStatus(401); // Unauthorized
            throw new Error("User not authenticated");
        }
        return await this.postService.createPost(userId, content);
    }

    @Get()
    @Security("jwt", ["member"])
    public async getPosts(@Query() page: number, @Request() request: express.Request): Promise<Array<{id: string, member: string, posted: Date, content: string, image: string}>> {
        const userId = this.extractUserId(request);
        if (!userId) {
            this.setStatus(401); // Unauthorized
            throw new Error("User not authenticated");
        }
        return await this.postService.getPosts(userId, page);
    }

    private extractUserId(request: express.Request): string | null {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) return null;
        try {
            const decoded = jwt.verify(token, process.env.MASTER_SECRET) as jwt.JwtPayload;
            return decoded.id;
        } catch (error) {
            console.error('JWT verification failed:', error);
            return null;
        }
    }
}
