import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/createAccount.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly config: ConfigService,
  ) {}

  async createAccount(
    createAccountDto: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    const { email, password, role } = createAccountDto;
    try {
      const user = await this.users.findOne({ email });
      if (user) {
        return {
          ok: false,
          error: '이미 존재하는 계정입니다.',
        };
      }
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const { email, password } = loginInput;
    try {
      const user = await this.users.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: '존재하지 않는 이메일 입니다.',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: '비밀번호가 일치하지 않습니다.',
        };
      }
      const token = jwt.sign({ id: user.id }, this.config.get('JWT_KEY'));
      return { ok: true, token };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
