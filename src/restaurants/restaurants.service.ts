import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  public async getOrCreateCategory(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase().replace(/ +/g, ' ');
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.categories.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      category = await this.categories.save(
        this.categories.create({
          slug: categorySlug,
        }),
      );
    }
    return category;
  }

  public async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const category = await this.getOrCreateCategory(
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
      const restaurant = await this.restaurants.findOne(
        {
          id: editRestaurantInput.restaurantId,
        },
        {
          loadRelationIds: true,
        },
      );

      if (!restaurant)
        return { ok: false, error: '레스토랑이 존재하지 않습니다.' };

      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '자신의 레스토랑이 아니면 편집할 수 없습니다.',
        };
      }

      if (editRestaurantInput.categoryName) {
        const category = await this.getOrCreateCategory(
          editRestaurantInput.categoryName,
        );
      }

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
}
