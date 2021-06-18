import { ArgsType, Field, ID, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class UserProfileInput {
  @Field(() => ID)
  id: number;
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field(() => User, { nullable: true })
  user?: User;
}
