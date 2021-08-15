import { Dish } from 'src/restaurants/entities/dish.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { RestaurantRepository } from 'src/restaurants/repositories/restaurant.repository';
import { OrderItem } from './entities/order-item.entity';
import { GetOrdersOutput, GetOrdersInput } from './dtos/get-orders.dto';

@Injectable()
export class OrderService {
  constructor(
    private readonly restaurants: RestaurantRepository,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  public async createOrder(
    client: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne({ id: restaurantId });
      if (!restaurant) {
        return {
          ok: false,
          error: '존재하지 않는 레스토랑입니다.',
        };
      }

      const orderItems: OrderItem[] = [];
      let orderFinalPrice = 0;
      for (const item of items) {
        if (!restaurant?.menuIds.find((id) => id === item.dishId)) {
          return {
            ok: false,
            error: '식당에 없는 메뉴를 주문하셨습니다.',
          };
        }
        const dish = await this.dishes.findOne({ id: item.dishId });
        if (!dish) {
          return {
            ok: false,
            error: '존재하지 않는 요리를 주문하셨습니다.',
          };
        }

        orderFinalPrice += dish.price;
        if (item.options) {
          for (const itemOption of item.options) {
            const dishOption = dish.options.find(
              (dishOption) => dishOption.name === itemOption.name,
            );
            if (!dishOption) {
              return {
                ok: false,
                error: '존재하지 않는 옵션 이름입니다.',
              };
            }

            if (itemOption.choice) {
              const dishChoice = dishOption.choices.find(
                (dishOptionChoice) =>
                  dishOptionChoice.name === itemOption.choice,
              );
              if (!dishChoice) {
                return {
                  ok: false,
                  error: '존재하지 않는 옵션 아이템입니다.',
                };
              }
              if (dishChoice?.extra) orderFinalPrice += dishChoice.extra;
            } else {
              if (dishOption.extra) orderFinalPrice += dishOption.extra;
            }
          }

          const orderItem = await this.orderItems.save(
            this.orderItems.create({
              dish,
              options: item.options,
            }),
          );

          orderItems.push(orderItem);
        }
      }

      const order = await this.orders.create({
        customer: client,
        restaurant,
        items: orderItems,
        total: orderFinalPrice,
      });
      await this.orders.save(order);

      return {
        ok: true,
      };
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  }

  public async getOrders(
    authUser: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      if (authUser.role === UserRole.Client) {
        const orders = await this.orders.find({
          where: {
            status,
            customer: authUser,
          },
          relations: ['items'],
        });
        return {
          ok: true,
          orders,
        };
      } else if (authUser.role === UserRole.Delivery) {
        const orders = await this.orders.find({
          where: {
            driver: authUser,
            status,
          },
        });
        return {
          ok: true,
          orders,
        };
      } else if (authUser.role === UserRole.Owner) {
        const orders = await this.restaurants.find({
          where: {
            id: authUser.id,
          },
          relations: ['orders'],
        });
        console.log(orders);
        return {
          ok: true,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        ok: false,
        error,
      };
    }
  }
}
