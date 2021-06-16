import { Args, Mutation, Query } from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/createAccount.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  seeUsers(): boolean {
    return true;
  }

  @Mutation(() => CreateAccountOutput)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    const { ok, error } = await this.usersService.createAccount(
      createAccountInput,
    );
    return {
      ok,
      error,
    };
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    const { ok, error, token } = await this.usersService.login(loginInput);
    return {
      ok,
      error,
      token,
    };
  }
}
