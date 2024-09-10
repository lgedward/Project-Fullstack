"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.anna = void 0;
const supertest_1 = __importDefault(require("supertest"));
const http = __importStar(require("http"));
const db = __importStar(require("./db"));
const app_1 = __importDefault(require("../src/app"));
let server;
beforeAll(async () => {
    server = http.createServer(app_1.default);
    server.listen();
    return db.reset();
});
afterAll((done) => {
    db.shutdown();
    server.close(done);
});
exports.anna = {
    email: 'anna@books.com',
    password: 'annaadmin',
    name: "Anna Admin",
};
const tommy = {
    email: "tommy@books.com",
    password: "tommytimekeeper",
    name: "Tommy Timekeeper",
};
const tommyPosts = [];
const timmy = {
    email: "timmy@books.com",
    password: "timmyteaboy",
    name: "Timmy Teaboy",
};
let timmyId;
const timmyPosts = [];
const terry = {
    email: "terry@books.com",
    password: "terrytroublemaker",
    name: "Terry Troublemaker",
};
const post = {
    content: 'Some old guff',
    image: 'https://communications.ucsc.edu/wp-content/uploads/2016/11/ucsc-seal.jpg',
};
async function loginAs(member) {
    let accessToken;
    await (0, supertest_1.default)(server)
        .post('/api/v0/login')
        .send({ email: member.email, password: member.password })
        .expect(200)
        .then((res) => {
        accessToken = res.body.accessToken;
    });
    return accessToken;
}
test('Anna creates Tommy, Timmy and Terry', async () => {
    const accessToken = await loginAs(exports.anna);
    await (0, supertest_1.default)(server)
        .post('/api/v0/member/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(tommy)
        .expect(201);
    await (0, supertest_1.default)(server)
        .post('/api/v0/member/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(timmy)
        .expect(201)
        .then((res) => {
        timmyId = res.body.id;
    });
    await (0, supertest_1.default)(server)
        .post('/api/v0/member/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(terry)
        .expect(201);
});
test('Tommy makes two posts', async () => {
    const accessToken = await loginAs(tommy);
    await (0, supertest_1.default)(server)
        .post('/api/v0/post/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(post)
        .expect(201)
        .then((res) => {
        tommyPosts.push(res.body.id);
    });
    await (0, supertest_1.default)(server)
        .post('/api/v0/post/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(post)
        .expect(201)
        .then((res) => {
        tommyPosts.push(res.body.id);
    });
});
test("Timmy cannot see Tommy's posts", async () => {
    const accessToken = await loginAs(timmy);
    await (0, supertest_1.default)(server)
        .get('/api/v0/post?page=1')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        expect(res.body.length).toBe(0);
    });
});
test('Tommy sends Timmy a friend request', async () => {
    const accessToken = await loginAs(tommy);
    await (0, supertest_1.default)(server)
        .post('/api/v0/friend/' + timmyId)
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(201);
});
test("Timmy accepts Tommy's friend request", async () => {
    const accessToken = await loginAs(timmy);
    let fid = '';
    await (0, supertest_1.default)(server)
        .get('/api/v0/request/')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        fid = res.body[0].id;
    });
    await (0, supertest_1.default)(server)
        .put('/api/v0/request/' + fid)
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(201);
});
test("Timmy can now see Tommy's posts", async () => {
    const accessToken = await loginAs(timmy);
    await (0, supertest_1.default)(server)
        .get('/api/v0/post?page=1')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        expect(res.body.length).toBe(2);
    });
});
test("Terry cannot see Tommy's posts", async () => {
    const accessToken = await loginAs(terry);
    await (0, supertest_1.default)(server)
        .get('/api/v0/post?page=1')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        expect(res.body.length).toBe(0);
    });
});
test('Timmy makes a post', async () => {
    const accessToken = await loginAs(timmy);
    await (0, supertest_1.default)(server)
        .post('/api/v0/post/')
        .set('Authorization', 'Bearer ' + accessToken)
        .send(post)
        .expect(201)
        .then((res) => {
        timmyPosts.push(res.body.id);
    });
});
test("Tommy can see Timmy's post and his own", async () => {
    const accessToken = await loginAs(tommy);
    await (0, supertest_1.default)(server)
        .get('/api/v0/post?page=1')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        expect(res.body.length).toBe(3);
        expect(res.body[0].id).toBe(timmyPosts[0]);
        expect(res.body[2].id).toBe(tommyPosts[0]);
        expect(res.body[1].id).toBe(tommyPosts[1]);
    });
});
test("Timmy can see Tommy's posts and his own", async () => {
    const accessToken = await loginAs(timmy);
    await (0, supertest_1.default)(server)
        .get('/api/v0/post?page=1')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        expect(res.body.length).toBe(3);
        expect(res.body[0].id).toBe(timmyPosts[0]);
        expect(res.body[2].id).toBe(tommyPosts[0]);
        expect(res.body[1].id).toBe(tommyPosts[1]);
    });
});
test("Terry cannot see Timmy's or Tommy's posts", async () => {
    const accessToken = await loginAs(terry);
    await (0, supertest_1.default)(server)
        .get('/api/v0/post?page=1')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        expect(res.body.length).toBe(0);
    });
});
test('Tommy no longer wants Timmy as a friend', async () => {
    const accessToken = await loginAs(tommy);
    await (0, supertest_1.default)(server)
        .delete('/api/v0/friend/' + timmyId)
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        expect(res.body.name).toBe(timmy.name);
    });
});
test('Timmy can now only see his own post', async () => {
    const accessToken = await loginAs(timmy);
    await (0, supertest_1.default)(server)
        .get('/api/v0/post?page=1')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].id).toBe(timmyPosts[0]);
    });
});
test('Tommy can now only see his own posts', async () => {
    const accessToken = await loginAs(tommy);
    await (0, supertest_1.default)(server)
        .get('/api/v0/post?page=1')
        .set('Authorization', 'Bearer ' + accessToken)
        .expect(200)
        .then((res) => {
        expect(res.body.length).toBe(2);
        expect(res.body[0].id).toBe(tommyPosts[1]);
        expect(res.body[1].id).toBe(tommyPosts[0]);
    });
});
