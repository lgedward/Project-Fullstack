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

import {
    Body,
    Controller,
    Post,
    Response,
    Route,
  } from 'tsoa';
  
  import {Credentials, Authenticated} from '.';
  import {AuthService} from './authService';
  
  @Route('login')
  export class AuthController extends Controller {
    @Post()
    @Response('401', 'Unauthorised')
    public async login(
      @Body() credentials: Credentials,
    ): Promise<Authenticated|undefined> {
      return new AuthService().login(credentials)
        .then(async (user: Authenticated|undefined): Promise<Authenticated|undefined> => {
          if (!user) {
            this.setStatus(401);
          }
          return user;
        });
    }
  }
  