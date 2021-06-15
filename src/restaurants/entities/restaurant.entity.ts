import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  @IsString()
  @Length(3)
  name: string;

  @Field()
  @Column()
  @IsString()
  address: string;

  @Field()
  @Column()
  @IsString()
  ownerName: string;

  @Field()
  @Column()
  @IsString()
  categoryName: string;

  @Field({ defaultValue: false })
  @Column({ default: false })
  @IsOptional()
  @IsBoolean()
  isVegan: boolean;
}
