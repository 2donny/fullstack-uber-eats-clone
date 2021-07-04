import { Field, InputType, Int, ObjectType, ArgsType } from '@nestjs/graphql';
import { CoreOutput } from './output.dto';

@InputType({ isAbstract: true })
@ArgsType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  page: number;
}

@ObjectType()
export class PaginationOutput extends CoreOutput {
  @Field(() => Int, { nullable: true })
  totalPages?: number;
}
