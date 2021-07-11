import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  RestaurantsInput,
  RestaurantsOutput,
} from './dto/restaurant/restaurants.dto';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';
import {
  RestaurantInput,
  RestaurantOutput,
} from './dto/restaurant/restaurant.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dto/restaurant/search-restaurant.dto';
import { Raw, Repository } from 'typeorm';
import { CreateDishInput, CreateDishOutput } from './dto/dish/create-dish.dto';
import { Dish } from './entities/dish.entity';
import { EditDishOutput, EditDishInput } from './dto/dish/edit-dish.dto';
import { DishRepository } from './repositories/dish.repository';
import { DeleteDishOutput, DeleteDishInput } from './dto/dish/delete-dish.dto';

const NUMBER_PER_PAGE = 5;

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly restaurants: RestaurantRepository,
    private readonly categories: CategoryRepository,
    private readonly dishes: DishRepository,
  ) {}

  public async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const category = await this.categories.getOrCreate(
        createRestaurantInput.categoryName,
      );
      const newRestaurant = this.restaurants.create({
        ...createRestaurantInput,
        owner,
        category,
      });
      await this.restaurants.save(newRestaurant);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '음식점 생성을 실패했습니다',
      };
    }
  }

  public async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const hashError = await this.restaurants.checkRestaurantExeception(
        editRestaurantInput.restaurantId,
        owner.id,
      );
      if (hashError) return hashError;

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save({
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && { category }),
      });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  public async deleteRestaurant(
    owner: User,
    { restaurantId }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const hasError = await this.restaurants.checkRestaurantExeception(
        restaurantId,
        owner.id,
      );
      if (hasError) return hasError;

      await this.restaurants.delete({ id: restaurantId });
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  public async SeeCategories(): Promise<SeeCategories> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 찾을 수 없습니다.',
      };
    }
  }

  public async restaurantCount(category: Category): Promise<number> {
    return this.restaurants.count({ category });
  }

  public async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: '카테고리가 존재하지 않습니다.',
        };
      }

      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        take: NUMBER_PER_PAGE,
        skip: NUMBER_PER_PAGE * (page - 1),
      });

      const totalRestaurants = await this.restaurantCount(category);
      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalRestaurants / NUMBER_PER_PAGE),
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러올 수 없습니다.',
      };
    }
  }

  public async seeAllRestaurants({
    page,
  }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalItems] =
        await this.restaurants.findAndCountWithPagination(page);
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalItems / 10),
        totalItems,
      };
    } catch (error) {
      return {
        ok: false,
        error: '레스토랑을 불러올 수 없습니다.',
      };
    }
  }

  public async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { id: restaurantId },
        { relations: ['menu'] },
      );
      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑이 존재하지 않습니다.',
        };
      }
      return {
        ok: true,
        restaurant,
      };
    } catch (error) {
      return {
        ok: false,
        error: '레스토랑 로딩을 실패했습니다.',
      };
    }
  }

  public async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalItems] =
        await this.restaurants.findAndCountWithPagination(page, {
          where: {
            name: Raw((name) => `${name} ILIKE '%${query}%'`),
          },
        });

      if (!restaurants) {
        return {
          ok: false,
          error: '해당 레스토랑이 존재하지 않습니다.',
        };
      }

      return {
        ok: true,
        restaurants,
        totalPages: Math.ceil(totalItems / 10),
        totalItems,
      };
    } catch (error) {
      return {
        ok: false,
        error: '레스토랑을 찾을 수 없습니다.',
      };
    }
  }

  public async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const hasError = await this.restaurants.checkRestaurantExeception(
        createDishInput.restaurantId,
        owner.id,
      );
      if (hasError) return hasError;

      const restaurant = await this.restaurants.findOne({
        id: createDishInput.restaurantId,
      });
      if (!restaurant) {
        return {
          ok: false,
          error: '존재하지 않는 레스토랑입니다.',
        };
      }

      const dish = await this.dishes.create({
        ...createDishInput,
        restaurant,
      });
      await this.dishes.save(dish);

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '요리를 생성하는 데 실패했습니다.',
      };
    }
  }

  public async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const hasError = await this.dishes.checkDishException(
        owner.id,
        editDishInput.id,
      );

      if (hasError) return hasError;

      await this.dishes.update(editDishInput.id, {
        ...editDishInput,
      });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '음식 정보 수정에 실패했습니다.',
      };
    }
  }

  public async deleteDish(
    owner: User,
    deleteDishInput: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const hasError = await this.dishes.checkDishException(
        owner.id,
        deleteDishInput.dishId,
      );

      if (hasError) return hasError;

      await this.dishes.delete(deleteDishInput.dishId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '음식 삭제에 실패했습니다.',
      };
    }
  }
}
