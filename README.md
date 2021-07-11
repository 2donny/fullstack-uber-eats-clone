# Uber eats clone

The Backend of Uber eats clone

## Tech

(Server)

- NestJs
- GraphQL
- TypeScript
- TypeORM

## Todo List

- [x] Login
- [x] Create Account
- [x] Update Account
- [x] Delete Account
- [x] See Profile
- [x] Send Email
- [x] Verify Email

- [x] Create restaurant.
- [x] Edit restaurant.
- [x] Delete restaurant.

- [x] See Categories
- [x] See Restaurants by Category (pagination)
- [x] See Restaurant by id
- [x] Search Restaurant (pagination)
- [x] See Restaurants by name (pagination)
- [x] See Restaurant by id (pagination)

- [x] Create Dish
- [ ] Edit Dish
- [ ] Delete Dish

- [ ] Orders CRUD
- [ ] Orders Subscription (Owner, Customer, Delivery)

- [ ] Payments (paddle)

## TIL

06/15

(1) - cross-env를 통한 매끄러운 환경 변수 설정과, Joi를 통한 환경 변수의 유효성 검사.

```javascript
Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('dev', 'prod', 'test')
          .default('dev')
          .required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      }),
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
    }),
    RestaurantsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [],
      synchronize: true,
      logging: true,
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
  ],
  controllers: [],
  providers: [],
});
export class AppModule {}
```

<br />

위와 같이 Nest.js는 ConfigModule의 ValidationSchema를 통해 TypeOrmModule의 config로서 사용되는 환경변수들을 Validation할 수 있도록 해준다.

```javascript
  "scripts": {
    "start:dev": "cross-env NODE_ENV=dev nest start --watch",
    "start:prod": "cross-env NODE_ENV=prod nest start",
  }
```

또한 cross-env를 통해 `CLI`로 `OS independently`하게 `NODE_ENV`을 설정할 수 있다.

<br />
<br />

(2) - `Active record pattern` vs `Data Mapper pattern`

- Typeorm에서는 2가지 패턴을 제공한다. AR 패턴은 모든 것이 Model 안에서 일어난다. 기본적으로 모든 Model들은 `typeorm`에서 제공하는 `BaseEntity`를 상속해야한다. 그렇게 함으로써 CRUD를 상속받은 query method를 통해 Model안에서 메소드로서 사용할 수 있다. 또한 query method를 직접 정의할 때도 Model 안에서 정의한다. `Ruby on rails`, `Django`가 Active record 패턴이라고 할 수 있다.

- 그와 반대로 Data Mapper 패턴에서는 `Repository`라는 별도의 class를 통해 query method를 정의하고 `Repository<User>`를 상속함으로써 User Model에 대한 CRUD 메소드를 상속받을 수 있다.

<br />

```typescript
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../entity/User';

@EntityRepository()
export class UserRepository extends Repository<User> {
  findByName(firstName: string, lastName: string) {
    return this.createQueryBuilder('user')
      .where('user.firstName = :firstName', { firstName })
      .andWhere('user.lastName = :lastName', { lastName })
      .getMany();
  }
}
```

<br />

- 두 패턴은 각각 [pros and cons](https://typeorm.io/#/active-record-data-mapper) 가 있다. `Active Record pattern`은 하나의 Model안에서 메소드와, 필드를 관리할 수 있어 조금 덜 낯선 `OOP`방식이다.

- 또한 하나의 파일로 모든 것들을 관리할 수 있으므로 `Simplicity`가 보장되어 간단한 Application을 개발할 때 유리하다.

- 반면 엔터프라이즈급 Application에서 `Maintainability`를 고려한다면 `Data Mapper pattern`으로 Model과 Repository를 떨어뜨림으로서 유지보수를 용이하게 할 수 있다.
  - 또한 NestJs + Typeorm 개발 환경에서는 이 패턴이 조금 더 유리한데, NestJs가 Repository를 사용할 수 있는 모듈을 제공해주기 때문이다.
  - 또한 DB를 `mocking`해서 `Repository`를 `test`할 수도 있다. 이러한 이유로 프로젝트에서는 `Data Mapper` 패턴을 사용한다.

06-30

### (1) - MetaData

NestJs의 `@SetMetadata()`를 이용하여 Resolver에 `custom metadata`를 붙인다.

<br />

```typescript
export type allowedRoles = keyof typeof UserRole | 'Any';

export const Roles = (roles: allowedRoles[]) => SetMetadata('roles', roles);
```

위 함수는 요청 주체인 User의 `role`에 대한 custom metadata를 리턴하는 함수이다.

<br />

```typescript
class RestaurantResolver {
  @Mutation(() => EditRestaurantOutput)
  @Roles(['Owner'])
  public async editRestaurant(
    @AuthUser() owner: User,
    @Args('data') editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    return this.restaurantService.editRestaurant(owner, editRestaurantInput);
  }
}
```

위 예시를 보면 Resolver에 `roles metadata`를 붙인다.
roles metadata's value는 `Guard` 안에서 `reflector`를 통해 read된다.

<br />

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<allowedRoles[]>(
      'roles',
      context.getHandler(),
    );
    if (!roles) return true;

    ...

  }
}
```

일련의 flow는 다음과 같다.

유저가 `Request` 보냄 -> `AuthGuard`가 요청을 판별 (해당 리졸버로부터 읽은 metadata value를 통해 권한 없는 요청은 막는다) -> `Resolver`에서 response를 리턴.

07/05 - TIL

- OrderItem entity를 추가한 이유
  `createOrder` 리졸버에서 creteOrderInput을 들여다보면 `restaurantId`, `dishes` 2개의 인자를 받는다. 근데 dishes는 DishInputType인데 이것은 ```name, photo, price description, options, restaurant``` 전부 required로 받아야한다. 근데 주문을 하는 고객 입장에서 음식의 description, restaurant, price, photo를 줄 필요는 없다. restaurantId, items(options)만 추가하고 싶기 때문에 별도의 OrderItem entity를 만든다. 
  - 근데 의문점은 왜 entity인가? 그냥 TypeScript class만 만들어서 써도 되지 않을까?

