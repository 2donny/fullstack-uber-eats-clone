import { CoreOutput } from 'src/common/dtos/output.dto';
import { EntityRepository, Repository, FindManyOptions } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  private ITEMS_PER_PAGE = 10;

  public async checkRestaurantExeception(
    restaurantId,
    ownerId,
  ): Promise<CoreOutput> | undefined {
    const restaurant = await this.findOne({ id: restaurantId });
    if (!restaurant) {
      return {
        ok: false,
        error: '식당이 존재하지 않습니다.',
      };
    }

    if (restaurant.ownerId !== ownerId) {
      return {
        ok: false,
        error: '나의 식당이 아닙니다 (권한 없음)',
      };
    }
  }

  public async findAndCountWithPagination(
    page: number,
    options?: FindManyOptions<Restaurant>,
  ) {
    return this.findAndCount({
      ...options,
      take: this.ITEMS_PER_PAGE,
      skip: this.ITEMS_PER_PAGE * (page - 1),
    });
  }
}
