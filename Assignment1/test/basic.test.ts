/*
#######################################################################
#
# Copyright (C) 2022-2024 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
#######################################################################
#                   DO NOT MODIFY THIS FILE
#######################################################################
*/

import supertest from 'supertest';
import * as http from 'http';

import * as db from './db';
import app from '../src/app';

let server: http.Server<
  typeof http.IncomingMessage,
  typeof http.ServerResponse
>;

beforeAll(async () => {
  server = http.createServer(app);
  server.listen();
  return db.reset();
});

afterAll((done) => {
  db.shutdown();
  server.close(done);
});

export interface Member {
  email: string;
  password: string;
  name: string;
}

export const anna = {
  email: 'anna@books.com',
  password: 'annaadmin',
  name: "Anna Admin",
};

const tommy = {
  email: "tommy@books.com",
  password: "tommytimekeeper",
  name: "Tommy Timekeeper",
};
const tommyPosts: Array<string> = [];

const timmy = {
  email: "timmy@books.com",
  password: "timmyteaboy",
  name: "Timmy Teaboy",
};
let timmyId: string;
const timmyPosts: Array<string> = [];

const terry = {
  email: "terry@books.com",
  password: "terrytroublemaker",
  name: "Terry Troublemaker",
};

const post = {
  content: 'Some old guff',
  image:
    'https://communications.ucsc.edu/wp-content/uploads/2016/11/ucsc-seal.jpg',
};

async function loginAs(member: Member): Promise<string | undefined> {
  let accessToken;
  await supertest(server)
    .post('/api/v0/login')
    .send({ email: member.email, password: member.password })
    .expect(200)
    .then((res) => {
      accessToken = res.body.accessToken;
    });
  return accessToken;
}

test('Anna creates Tommy, Timmy and Terry', async () => {
  const accessToken = await loginAs(anna);
  console.log("ACCESSTOKEN:")
  console.log(accessToken)
  
  

  await supertest(server)
    .post('/api/v0/member/')
    .set('Authorization', 'Bearer ' + accessToken)
    .send(tommy)
    .expect(201);
  await supertest(server)
    .post('/api/v0/member/')
    .set('Authorization', 'Bearer ' + accessToken)
    .send(timmy)
    .expect(201)
    .then((res) => {
      timmyId = res.body.id;
    });
  await supertest(server)
    .post('/api/v0/member/')
    .set('Authorization', 'Bearer ' + accessToken)
    .send(terry)
    .expect(201);
});

test('Tommy makes two posts', async () => {
  const accessToken = await loginAs(tommy);
  await supertest(server)
    .post('/api/v0/post/')
    .set('Authorization', 'Bearer ' + accessToken)
    .send(post)
    .expect(201)
    .then((res) => {
      tommyPosts.push(res.body.id);
    });
  await supertest(server)
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
  await supertest(server)
    .get('/api/v0/post?page=1')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(200)
    .then((res) => {
      expect(res.body.length).toBe(0);
    });
});

test('Tommy sends Timmy a friend request', async () => {
  const accessToken = await loginAs(tommy);
  await supertest(server)
    .post('/api/v0/friend/' + timmyId)
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(201);
});

test("Timmy accepts Tommy's friend request", async () => {
  const accessToken = await loginAs(timmy);
  let fid: string = '';
  await supertest(server)
    .get('/api/v0/request/')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(200)
    .then((res) => {
      fid = res.body[0].id;
    });
  await supertest(server)
    .put('/api/v0/request/' + fid)
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(201);
});

test("Timmy can now see Tommy's posts", async () => {
  const accessToken = await loginAs(timmy);
  await supertest(server)
    .get('/api/v0/post?page=1')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(200)
    .then((res) => {
      expect(res.body.length).toBe(2);
    });
});

test("Terry cannot see Tommy's posts", async () => {
  const accessToken = await loginAs(terry);
  await supertest(server)
    .get('/api/v0/post?page=1')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(200)
    .then((res) => {
      expect(res.body.length).toBe(0);
    });
});

test('Timmy makes a post', async () => {
  const accessToken = await loginAs(timmy);
  await supertest(server)
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
  await supertest(server)
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
  await supertest(server)
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
  await supertest(server)
    .get('/api/v0/post?page=1')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(200)
    .then((res) => {
      expect(res.body.length).toBe(0);
    });
});

test('Tommy no longer wants Timmy as a friend', async () => {
  const accessToken = await loginAs(tommy);
  await supertest(server)
    .delete('/api/v0/friend/' + timmyId)
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(200)
    .then((res) => {
      expect(res.body.name).toBe(timmy.name);
    });
});

test('Timmy can now only see his own post', async () => {
  const accessToken = await loginAs(timmy);
  await supertest(server)
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
  await supertest(server)
    .get('/api/v0/post?page=1')
    .set('Authorization', 'Bearer ' + accessToken)
    .expect(200)
    .then((res) => {
      expect(res.body.length).toBe(2);
      expect(res.body[0].id).toBe(tommyPosts[1]);
      expect(res.body[1].id).toBe(tommyPosts[0]);
    });
});
