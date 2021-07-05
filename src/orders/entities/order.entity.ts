import {
  InputType,
  ObjectType,
  Field,
  registerEnumType,
  Int,
} from '@nestjs/graphql';
import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { CoreEntity } from 'src/common/entities/core.entity';
import { IsEnum } from 'class-validator';
import { User } from 'src/users/entities/user.entity';
import { Restaurant } from 'src/restaurants/entities/restaurant.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
});

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user: User) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  customer?: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user: User) => user.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  driver?: User;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant: Restaurant) => restaurant.orders, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @Field(() => Restaurant)
  restaurant: Restaurant;

  @Field(() => [Dish])
  @ManyToMany(() => Dish)
  @JoinTable()
  dishes: Dish[];

  @Field(() => Int)
  @Column()
  total: number;

  @Field(() => OrderStatus)
  @Column({
    type: 'enum',
    enum: OrderStatus,
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
