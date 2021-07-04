import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';
import {
  CategoryResolver,
  RestaurantsResolver,
  DishResolver,
} from './restaurants.resolver';
import { RestaurantsService } from './restaurants.service';
import { Dish } from './entities/dish.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RestaurantRepository, CategoryRepository, Dish]),
  ],
  providers: [
    RestaurantsResolver,
    CategoryResolver,
    DishResolver,
    RestaurantsService,
  ],
})
export class RestaurantsModule {}
