import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dtos/output.dto';

@ArgsType()
export class DeleteRestaurantInput {
  @Field()
  @IsNumber()
  restaurantId: number;
}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
