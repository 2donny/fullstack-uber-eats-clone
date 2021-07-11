import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { RestaurantRepository } from 'src/restaurants/repositories/restaurant.repository';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { OrderResolver } from './orders.resolver';
import { OrderService } from './orders.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, RestaurantRepository, Dish]),
  ],
  providers: [OrderService, OrderResolver],
})
export class OrdersModule {}
