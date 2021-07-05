import { Field, ArgsType, ObjectType, Int } from '@nestjs/graphql';
import {
  PaginationOutput,
  PaginationInput,
} from 'src/common/dtos/pagination.dto';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';

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
