import { EntityRepository, Repository } from 'typeorm';
import { Dish } from '../entities/dish.entity';
import { CoreOutput } from 'src/common/dtos/output.dto';

@EntityRepository(Dish)
export class DishRepository extends Repository<Dish> {
  public async checkDishException(
    ownerId: number,
    dishId: number,
  ): Promise<CoreOutput> | undefined {
    const dish = await this.findOne(
      { id: dishId },
      { relations: ['restaurant'] },
    );
    if (!dish) {
      return {
        ok: false,
        error: '음식이 존재하지 않습니다.',
      };
    }

    if (ownerId !== dish.restaurant.ownerId) {
      return {
        ok: false,
        error: '본인 레스토랑의 음식만 수정/삭제할 수 있습니다.',
      };
    }
  }
}
