import { Field, ArgsType, ObjectType, Int } from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';
import {
  PaginationOutput,
  PaginationInput,
} from 'src/common/dtos/pagination.dto';

@ArgsType()
export class SearchRestaurantInput extends PaginationInput {
  @Field()
  query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
  @Field(() => [Restaurant], { nullable: true })
  restaurants?: Restaurant[];

  @Field(() => Int, { nullable: true })
  totalItems?: number;
}
