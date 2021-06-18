import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationService: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    const { email, password, role } = createAccountInput;
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return {
          ok: false,
          error: '이미 존재하는 계정입니다.',
        };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verificationService.save(
        this.verificationService.create({
          user,
        }),
      );
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
      const user = await this.users.findOne(
        { email },
        { select: ['password', 'id'] },
      );
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
      const token = this.jwtService.sign({ id: user.id });
      return { ok: true, token };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return this.users.findOne({ id });
  }

  async editProfile(
    userId: number,
    { email, password, role }: EditProfileInput,
  ) {
    const user = await this.users.findOne({ id: userId });
    if (email) {
      user.email = email;
      user.verified = false;
    }
    if (password) user.password = password;
    if (role) user.role = role;
    return this.users.save(user);
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    const verification = await this.verificationService.findOne(
      { code },
      { relations: ['user'] },
    );
    if (verification?.user) {
      verification.user.verified = true;
      this.users.save(verification.user);
      return {
        ok: true,
      };
    } else {
      return {
        ok: false,
        error: '유효하지 않는 코드입니다.',
      };
    }
  }
}
