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
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationService: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
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

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({ id });
      if (!user) {
        return {
          ok: false,
          error: '해당 유저가 존재하지 않습니다.',
        };
      } else {
        return {
          ok: true,
          user,
        };
      }
    } catch {
      return {
        ok: false,
        error: '해당 유저를 찾을 수 없습니다.',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password, role }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({ id: userId });
      console.log(user);
      if (email) {
        user.email = email;
        user.verified = false;
      }
      if (password) user.password = password;
      if (role) user.role = role;
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '프로필 편집 실패했습니다.',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verificationService.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification?.user) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        // await this.verificationService.delete(verification.id);
        await this.mailService.sendVerificationEmail(
          verification.user.email,
          code,
        );
        return {
          ok: true,
        };
      } else {
        return {
          ok: false,
          error: '이미 검증한 이메일입니다.',
        };
      }
    } catch (error) {
      return {
        ok: false,
        error: '검증할 수 없습니다.',
      };
    }
  }
}
