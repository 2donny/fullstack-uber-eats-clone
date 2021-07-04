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
        error: '레스토랑이 존재하지 않습니다.',
      };
    }

    if (restaurant.ownerId !== ownerId) {
      return {
        ok: false,
        error: '자신의 레스토랑이 아닙니다.',
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
