import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { OrderStatus, Order } from '../entities/order.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@InputType()
export class GetOrdersInput {
  @Field(() => OrderStatus)
  status: OrderStatus;
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field(() => [Order], { nullable: true })
  orders?: Order[];
}
