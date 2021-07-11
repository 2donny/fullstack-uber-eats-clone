import { EditDishOutput, EditDishInput } from './dto/dish/edit-dish.dto';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Roles } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { SeeCategories } from './dto/category/see-categories.dto';
import { CategoryInput, CategoryOutput } from './dto/category/see-category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/restaurant/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/restaurant/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/restaurant/edit-restaurant.dto';
import {
  RestaurantsOutput,
  RestaurantsInput,
} from './dto/restaurant/restaurants.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantsService } from './restaurants.service';
import {
  RestaurantInput,
  RestaurantOutput,
} from './dto/restaurant/restaurant.dto';
import {
  SearchRestaurantOutput,
  SearchRestaurantInput,
} from './dto/restaurant/search-restaurant.dto';
import { Dish } from './entities/dish.entity';
import { CreateDishInput, CreateDishOutput } from './dto/dish/create-dish.dto';
import { DeleteDishInput, DeleteDishOutput } from './dto/dish/delete-dish.dto';

@Resolver(() => Restaurant)
export class RestaurantsResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Query(() => RestaurantsOutput)
  public async seeAllRestaurants(
    @Args('input') restaurantInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.seeAllRestaurants(restaurantInput);
  }

  @Query(() => RestaurantOutput)
  public async restaurant(
    @Args() restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    return this.restaurantService.findRestaurantById(restaurantInput);
  }

  @Query(() => SearchRestaurantOutput)
  public async searchRestaurant(
    @Args() searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput);
  }

  @Mutation(() => CreateRestaurantOutput)
  @Roles(['Owner'])
  public async createRestaurant(
    @AuthUser() authUser: User,
    @Args('input') createRestaurant: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    return this.restaurantService.createRestaurant(authUser, createRestaurant);
  }

  @Mutation(() => EditRestaurantOutput)
  @Roles(['Owner'])
  public async editRestaurant(
    @AuthUser() owner: User,
    @Args('data') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }

  @Mutation(() => DeleteRestaurantOutput)
  @Roles(['Owner'])
  public async deleteRestaurant(
    @AuthUser() owner: User,
    @Args() restaurantId: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(owner, restaurantId);
  }
}

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @ResolveField(() => Int)
  restaurantCount(@Parent() category: Category): Promise<number> {
    return this.restaurantService.restaurantCount(category);
  }

  @Query(() => SeeCategories)
  seeAllCategories(): Promise<SeeCategories> {
    return this.restaurantService.SeeCategories();
  }

  @Query(() => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput);
  }
}

@Resolver(() => Dish)
export class DishResolver {
  constructor(private readonly restaurantService: RestaurantsService) {}

  @Mutation(() => CreateDishOutput)
  @Roles(['Owner'])
  public async createDish(
    @AuthUser() owner: User,
    @Args('input') createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    return this.restaurantService.createDish(owner, createDishInput);
  }

  @Mutation(() => EditDishOutput)
  @Roles(['Owner'])
  public async editDish(
    @AuthUser() owner: User,
    @Args('input') editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    return this.restaurantService.editDish(owner, editDishInput);
  }

  @Mutation(() => EditDishOutput)
  @Roles(['Owner'])
  public async deleteDish(
    @AuthUser() owner: User,
    @Args('input') deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    return this.restaurantService.deleteDish(owner, deleteDishInput);
  }
}
