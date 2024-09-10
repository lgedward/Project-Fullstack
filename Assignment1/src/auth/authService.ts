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

import * as jwt from "jsonwebtoken";

import {SessionUser} from '../types';
import {Credentials, Authenticated, User} from '.';

import { pool } from '../db';

export class AuthService {
    public async login(credentials: Credentials): Promise<Authenticated|undefined>  {
        const select =
        `SELECT data` +
        ` FROM member` +
        ` WHERE data->>'email' = $1`+
        ` AND data->>'pwhash' = crypt($2, 'cs')`;
        const query = {
            text: select,
            values: [credentials.email, credentials.password],
        };
        const { rows } = await pool.query(query);
        if (rows.length == 1){
            const user = rows[0].data;
            console.log(user)
            const accessToken = jwt.sign(
                {email: user.email, name: user.name, roles: user.roles}, 
                `${process.env.MASTER_SECRET}`, {
                    expiresIn: '30m',
                    algorithm: 'HS256'
                });
            return { name: user.name, accessToken: accessToken };
        }
        return undefined;
    }

  public async check(authHeader?: string, scopes?: string[]): Promise<SessionUser>  {
    console.log("headers:")
    console.log(authHeader)
    return new Promise((resolve, reject) => {
      if (!authHeader) {
        reject(new Error("Unauthorised"));
      }
      else {
        const token = authHeader.split(' ')[1];
        jwt.verify(token,
          `${process.env.MASTER_SECRET}`, 
          (err: jwt.VerifyErrors | null, decoded?: object | string) => 
          {
            const user = decoded as User
            if (err) {
              reject(err);
            } else if (scopes){
              for (const scope of scopes) {
                if (!user.roles || !user.roles.includes(scope)) {
                  reject(new Error("Unauthorised"));
                }
              }
            }
            console.log("WE RESOLVED")
            console.log(user.email)
            console.log(user.name)
            resolve({email: user.email, name: user.name});
          });
      }
    });
  }
}
