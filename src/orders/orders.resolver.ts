import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { CreateDishOutput } from 'src/restaurants/dto/dish/create-dish.dto';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/role.decorator';
import { GetOrdersOutput, GetOrdersInput } from './dtos/get-orders.dto';

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(() => CreateDishOutput)
  @Roles(['Client'])
  public async createOrder(
    @AuthUser() authUser: User,
    @Args('input')
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(authUser, createOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @Roles(['Any'])
  public async getOrders(
    @AuthUser() authUser: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(authUser, getOrdersInput);
  }
}
