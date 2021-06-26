import {
  ArgsType,
  Field,
  InputType,
  Int,
  OmitType,
  PartialType,
} from '@nestjs/graphql';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
class UpdateRestaurantInputType extends PartialType(
  OmitType(Restaurant, ['id']),
) {}

@ArgsType()
export class UpdateRestaurantInput {
  @Field(() => Int)
  id: number;

  @Field(() => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
