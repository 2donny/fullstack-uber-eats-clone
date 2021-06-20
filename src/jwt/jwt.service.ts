import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interface';
import { CONFIG_OPTIONS } from '../common/common.constants';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly jwtOptions: JwtModuleOptions,
  ) {}
  sign(payload: any): string {
    const token = jwt.sign(payload, this.jwtOptions.privateKey);
    return token;
  }

  verify(token: string) {
    return jwt.verify(token, this.jwtOptions.privateKey);
  }
}
