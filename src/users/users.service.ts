import { createAccountInput } from './dto/createAccount.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  createAccount(createAccountDto: createAccountInput) {
    console.log(createAccountDto);
    const newUser = this.users.create(createAccountDto);
    return this.users.save(newUser);
  }
}
