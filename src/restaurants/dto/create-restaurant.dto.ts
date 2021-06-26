import { InputType, OmitType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@InputType()
export class CreateRestaurantInput extends OmitType(Restaurant, ['id']) {}

@InputType()
export class CreateRestaurantOutput extends CoreOutput {}
