import {
  InputType,
  ObjectType,
  Field,
  Int,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { Dish } from '../../entities/dish.entity';

@InputType()
export class EditDishInput extends PartialType(
  PickType(Dish, ['id', 'name', 'description', 'options', 'photo', 'price']),
) {}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
