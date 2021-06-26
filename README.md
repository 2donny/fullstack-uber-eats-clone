# Uber eats clone

The Backend of Uber eats clone

## Tech

- NestJs
- GraphQL
- TypeScript
- TypeORM

## Entity(Model)

- User
  - id
  - createdAt
  - updatedAt
  - email
  - password
  - role (client|owner|delivery)

- Restaurant
  - name
  - category (fk)
  - address
  - coverImage

## Todo List

- [x] Login
- [x] Create Account
- [x] Update Account
- [x] Delete Account
- [x] See Profile
- [x] Verify Email

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

- 위와 같이 Nest.js는 ConfigModule의 ValidationSchema를 통해 TypeOrmModule의 config로서 사용되는 환경변수들을 Validation할 수 있도록 해준다.

```javascript
  "scripts": {
    "start:dev": "cross-env NODE_ENV=dev nest start --watch",
    "start:prod": "cross-env NODE_ENV=prod nest start",
  }
```

- 그리고 cross-env를 통해 `CLI`로 `OS independently`하게 `NODE_ENV`을 설정할 수 있다.

<br />
<br />

(2) - `Active record pattern` vs `Data Mapper pattern`

- Typeorm에서는 2가지 패턴을 제공한다. AR 패턴은 모든 것이 Model 안에서 일어난다. 기본적으로 모든 Model들은 `typeorm`에서 제공하는 `BaseEntity`를 상속해야한다. 그렇게 함으로써 CRUD를 상속받은 query method를 통해 Model안에서 메소드로서 사용할 수 있다. 또한 query method를 직접 정의할 때도 Model 안에서 정의한다. `Ruby on rails`, `Django`가 Active record 패턴이라고 할 수 있다.

- 그와 반대로 Data Mapper 패턴에서는 `Repository`라는 별도의 class를 통해 query method를 정의하고 `Repository<User>`를 상속함으로써 User Model에 대한 CRUD 메소드를 상속받을 수 있다.

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


06-16

(1) - Dynamic Module