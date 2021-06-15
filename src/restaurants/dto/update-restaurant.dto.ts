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
class updateRestaurantInputType extends PartialType(
  OmitType(Restaurant, ['id']),
) {}

@ArgsType()
export class updateRestaurantDto {
  @Field(() => Int)
  id: number;

  @Field(() => updateRestaurantInputType)
  data: updateRestaurantInputType;
}
