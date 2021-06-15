import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsEmail, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

type UserRole = 'client' | 'owener' | 'delivery';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Field()
  @PrimaryColumn()
  @IsEmail()
  email: string;

  @Field()
  @Column()
  @Length(3, 20)
  password: string;

  @Field()
  @Column()
  role: UserRole;
}
