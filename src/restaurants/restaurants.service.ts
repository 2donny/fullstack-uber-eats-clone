import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

const NUMBER_PER_PAGE = 5;

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: RestaurantRepository,
    @InjectRepository(Category)
    private readonly categories: CategoryRepository,
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
      const hashError = await this.restaurants.checkExeception(
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
      const hasError = await this.restaurants.checkExeception(
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

  public async allCategories(): Promise<AllCategoriesOutput> {
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
      category.restaurants = restaurants;
      return {
        ok: true,
        category,
        totalPages: Math.ceil(totalRestaurants / NUMBER_PER_PAGE),
      };
    } catch {
      return {
        ok: false,
        error: '카테고리를 불러올 수 없습니다.',
      };
    }
  }
}
