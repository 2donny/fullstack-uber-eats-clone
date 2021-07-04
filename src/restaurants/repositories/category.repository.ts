import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  public async getOrCreate(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase().replace(/ +/g, ' ');
    const categorySlug = categoryName.replace(/ /g, '-');
    let category = await this.findOne({
      where: { slug: categorySlug },
    });
    if (!category) {
      category = await this.save(
        this.create({
          slug: categorySlug,
        }),
      );
    }
    return category;
  }
}
