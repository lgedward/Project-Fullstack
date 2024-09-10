"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberController = void 0;
const tsoa_1 = require("tsoa");
const memberService_1 = require("./memberService");
let MemberController = class MemberController extends tsoa_1.Controller {
    async createMember(member) {
        try {
            return await new memberService_1.MemberService.create(member).setStatus(201);
        }
        catch (error) {
            this.setStatus(409);
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            else {
                throw new Error('Unknown error occurred');
            }
        }
    }
    async getAllMembers() {
        try {
            const members = await this.memberService.getAllMembers();
            this.setStatus(200);
            return members;
        }
        catch (error) {
            this.setStatus(500);
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            else {
                throw new Error('Failed to retrieve members');
            }
        }
    }
};
exports.MemberController = MemberController;
__decorate([
    (0, tsoa_1.Post)(),
    (0, tsoa_1.Security)("jwt", ["admin"]),
    (0, tsoa_1.Response)('401', 'Unauthorised'),
    (0, tsoa_1.Response)('409', 'Conflict, Member could not be created'),
    (0, tsoa_1.Response)('201', 'Member Created'),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "createMember", null);
__decorate([
    (0, tsoa_1.Get)(),
    (0, tsoa_1.Security)("jwt", ["member"]),
    (0, tsoa_1.Response)('200', 'OK'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MemberController.prototype, "getAllMembers", null);
exports.MemberController = MemberController = __decorate([
    (0, tsoa_1.Route)('member')
], MemberController);
