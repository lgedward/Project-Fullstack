import {
    Body,
    Controller,
    Get,
    Path,
    Post,
    Query,
    Response,
    Request,
    Route,
    Security,
    SuccessResponse,
  } from 'tsoa';

import * as express from 'express';

import { MemberService } from './memberService';
import { Member } from './index';

@Route('member')
export class MemberController extends Controller {
    private memberService = new MemberService();

    @Post()
    @Security("jwt", ["admin"])
    @Response('409', 'Conflict, Member could not be created')
    @Response('201', 'Member Created')
    public async createMember(@Body() member: Member, @Request() request: express.Request): Promise<{id: string, name: string} | undefined> {
        console.log("Tried to post member:")
        console.log(member)
        const found = await this.memberService.get(member);
        if (found) {
            this.setStatus(409);
            return undefined;
        } else {
            try {
                const createdMember = await this.memberService.create(member);
                console.log("Did the create");
                this.setStatus(201);
                return createdMember;
            } catch (error) {
                this.setStatus(409);
                return undefined;
            }
        }
    }

    @Get()
    @Security("jwt", ["member"])
    @Response('200', 'OK')
    public async getAllMembers(): Promise<{id: string, name: string}[]> {
      try {
        const members = await this.memberService.getAllMembers();
        this.setStatus(200);
        return members;
      } catch (error) {
        this.setStatus(500);
        if (error instanceof Error) {
          throw new Error(error.message);
        } else {
          throw new Error('Failed to retrieve members');
        }
      }
    }
}