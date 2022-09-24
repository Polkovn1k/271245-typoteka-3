'use strict';

const express = require(`express`);
const request = require(`supertest`);
const Sequelize = require(`sequelize`);

const initDatabase = require(`../lib/init-db.js`);
const passwordUtils = require(`../lib/password.js`);
const {HttpCode} = require(`../../constants.js`);
const user = require(`./user.js`);
const {UserService} = require(`../data-service`);

const mockUsers = [
  {
    email: `test1@ya.ru`,
    passwordHash: passwordUtils.hashSync(`igorev`),
    name: `Egor`,
    surname: `Igorev`,
    avatar: `test_avatar_1.png`
  },
  {
    email: `test2@google.ru`,
    passwordHash: passwordUtils.hashSync(`egorov`),
    name: `Igor`,
    surname: `Egorov`,
    avatar: `test_avatar_2.png`
  }
];

const mockCategories = [`Деревья`, `Кино`, `Крипта`, `Про игры`, `Музыка`];

const mockData = [
  {
    "user": `test1@ya.ru`,
    "title": `А пользоваться сторонними сервисами лень`,
    "announcement": `С другой стороны постоянное информационно-пропагандистское обеспечение нашей деятельности обеспечивает широкому кругу (специалистов) участие в формировании позиций, занимаемых участниками в отношении поставленных задач. Равным образом постоянный количественный рост и сфера нашей активности играет важную роль в формировании системы обучения кадров, соответствует насущным потребностям. Он написал больше 30 хитов. Первая большая ёлка была установлена только в 1938 году. Не следует, однако забывать, что дальнейшее развитие различных форм деятельности способствует подготовки и реализации форм развития.`,
    "mainText": `Достичь успеха помогут ежедневные повторения. Простые ежедневные упражнения помогут достичь успеха. Не следует, однако забывать, что дальнейшее развитие различных форм деятельности способствует подготовки и реализации форм развития.`,
    "category": [`Деревья`],
    "comments": [
      {"user": `test2@google.ru`, "text": `Совсем немного... Планируете записать видосик на эту тему?`},
      {"user": `test1@ya.ru`, "text": `Планируете записать видосик на эту тему?`}
    ]
  },
  {
    "user": `test2@google.ru`,
    "title": `Рок — это протест`,
    "announcement": `Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Золотое сечение — соотношение двух величин, гармоническая пропорция. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много.`,
    "mainText": `Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Достичь успеха помогут ежедневные повторения. Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. Простые ежедневные упражнения помогут достичь успеха. Равным образом консультация с широким активом требуют определения и уточнения модели развития. Это один из лучших рок-музыкантов. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. Не следует, однако забывать, что дальнейшее развитие различных форм деятельности способствует подготовки и реализации форм развития. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. С другой стороны рамки и место обучения кадров способствует подготовки и реализации модели развития. Из под его пера вышло 8 платиновых альбомов. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Равным образом постоянный количественный рост и сфера нашей активности играет важную роль в формировании системы обучения кадров, соответствует насущным потребностям. Ёлки — это не просто красивое дерево. Это прочная древесина. Игры и программирование разные вещи. Не стоит идти в программисты, если вам нравятся только игры. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Первая большая ёлка была установлена только в 1938 году. Я часто что-то читаю, но часто ничего не понимаю.`,
    "category": [`Кино`, `Крипта`],
    "comments": [
      {"user": `test1@ya.ru`, "text": `Планируете записать видосик на эту тему? Мне кажется или я уже читал это где-то?`}
    ]
  },
  {
    "user": `test1@ya.ru`,
    "title": `Как достигнуть успеха не вставая с кресла`,
    "announcement": `Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. С другой стороны постоянное информационно-пропагандистское обеспечение нашей деятельности обеспечивает широкому кругу (специалистов) участие в формировании позиций, занимаемых участниками в отношении поставленных задач. Рок-музыка всегда ассоциировалась с протестами. Так ли это на самом деле? Равным образом постоянный количественный рост и сфера нашей активности играет важную роль в формировании системы обучения кадров, соответствует насущным потребностям. В лесу родилась елочка, в лесу она росла`,
    "mainText": `Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. С другой стороны рамки и место обучения кадров способствует подготовки и реализации модели развития. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. Равным образом консультация с широким активом требуют определения и уточнения модели развития. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. В лесу родилась елочка, в лесу она росла`,
    "category": [`Про игры`, `Музыка`],
    "comments": [
      {"user": `test2@google.ru`, "text": `Давно не пользуюсь стационарными компьютерами. Ноутбуки победили. Мне не нравится ваш стиль. Ощущение, что вы меня поучаете.`},
      {"user": `test1@ya.ru`, "text": `Совсем немного...`}
    ]
  },
  {
    "user": `test2@google.ru`,
    "title": `Что такое золотое сечение`,
    "announcement": `Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много.`,
    "mainText": `Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Равным образом постоянный количественный рост и сфера нашей активности играет важную роль в формировании системы обучения кадров, соответствует насущным потребностям. Ёлки — это не просто красивое дерево. Это прочная древесина. Не следует, однако забывать, что дальнейшее развитие различных форм деятельности способствует подготовки и реализации форм развития. Достичь успеха помогут ежедневные повторения. Рок-музыка всегда ассоциировалась с протестами. Так ли это на самом деле? В лесу родилась елочка, в лесу она росла Равным образом консультация с широким активом требуют определения и уточнения модели развития. Игры и программирование разные вещи. Не стоит идти в программисты, если вам нравятся только игры. С другой стороны рамки и место обучения кадров способствует подготовки и реализации модели развития. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Я часто что-то читаю, но часто ничего не понимаю. С другой стороны постоянное информационно-пропагандистское обеспечение нашей деятельности обеспечивает широкому кругу (специалистов) участие в формировании позиций, занимаемых участниками в отношении поставленных задач. Простые ежедневные упражнения помогут достичь успеха. Освоить вёрстку несложно. Возьмите книгу новую книгу и закрепите все упражнения на практике. Из под его пера вышло 8 платиновых альбомов. Золотое сечение — соотношение двух величин, гармоническая пропорция. Это один из лучших рок-музыкантов. Программировать не настолько сложно, как об этом говорят. Как начать действовать? Для начала просто соберитесь. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. Собрать камни бесконечности легко, если вы прирожденный герой. Первая большая ёлка была установлена только в 1938 году. Не следует, однако забывать, что дальнейшее развитие различных форм деятельности способствует подготовки и реализации форм развития.`,
    "category": [`Крипта`, `Про игры`, `Музыка`],
    "comments": [
      {"user": `test2@google.ru`, "text": `Совсем немного...`},
      {"user": `test1@ya.ru`, "text": `Плюсую, но слишком много буквы! Хочу такую же футболку :-)`},
      {"user": `test2@google.ru`, "text": `Мне кажется или я уже читал это где-то?`}
    ]
  },
  {
    "user": `test2@google.ru`,
    "title": `Как собрать камни бесконечности`,
    "announcement": `Я часто что-то читаю, но часто ничего не понимаю.`,
    "mainText": `Равным образом постоянный количественный рост и сфера нашей активности играет важную роль в формировании системы обучения кадров, соответствует насущным потребностям. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. В лесу родилась елочка, в лесу она росла Достичь успеха помогут ежедневные повторения. Он написал больше 30 хитов. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Процессор заслуживает особого внимания. Он обязательно понравится геймерам со стажем. Как начать действовать? Для начала просто соберитесь. С другой стороны рамки и место обучения кадров способствует подготовки и реализации модели развития. Из под его пера вышло 8 платиновых альбомов. С другой стороны постоянное информационно-пропагандистское обеспечение нашей деятельности обеспечивает широкому кругу (специалистов) участие в формировании позиций, занимаемых участниками в отношении поставленных задач. Ёлки — это не просто красивое дерево. Это прочная древесина. Помните, небольшое количество ежедневных упражнений лучше, чем один раз, но много. Рок-музыка всегда ассоциировалась с протестами. Так ли это на самом деле? Не следует, однако забывать, что дальнейшее развитие различных форм деятельности способствует подготовки и реализации форм развития. Игры и программирование разные вещи. Не стоит идти в программисты, если вам нравятся только игры. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Равным образом постоянный количественный рост и сфера нашей активности играет важную роль в формировании системы обучения кадров, соответствует насущным потребностям. Собрать камни бесконечности легко, если вы прирожденный герой. Это один из лучших рок-музыкантов. Простые ежедневные упражнения помогут достичь успеха. Я часто что-то читаю, но часто ничего не понимаю. Альбом стал настоящим открытием года. Мощные гитарные рифы и скоростные соло-партии не дадут заскучать. Вы можете достичь всего. Стоит только немного постараться и запастись книгами. Бороться с прокрастинацией несложно. Просто действуйте. Маленькими шагами. Этот смартфон — настоящая находка. Большой и яркий экран, мощнейший процессор — всё это в небольшом гаджете. Первая большая ёлка была установлена только в 1938 году.`,
    "category": [`Деревья`, `Крипта`, `Музыка`],
    "comments": [
      {"user": `test1@ya.ru`, "text": `Хочу такую же футболку :-) Мне кажется или я уже читал это где-то?`},
      {"user": `test1@ya.ru`, "text": `Мне не нравится ваш стиль. Ощущение, что вы меня поучаете. Планируете записать видосик на эту тему? Мне кажется или я уже читал это где-то?`},
      {"user": `test2@google.ru`, "text": `Планируете записать видосик на эту тему? Мне кажется или я уже читал это где-то? Давно не пользуюсь стационарными компьютерами. Ноутбуки победили.`}
    ]
  }
];

const createAPI = async () => {
  const mockDB = new Sequelize(`sqlite::memory:`, {logging: false});
  await initDatabase(mockDB, {categoryList: mockCategories, publications: mockData, users: mockUsers});
  const app = express();
  app.use(express.json());
  user(app, new UserService(mockDB));
  return app;
};

describe(`API creates user if data is valid`, () => {
  const validUserData = {
    name: `Grigoriy`,
    surname: `Dushkevich`,
    email: `newuser@yahoo.com`,
    password: `122345qwerty`,
    passwordRepeated: `122345qwerty`,
    avatar: `default.jpg`
  };

  let response;

  beforeAll(async () => {
    let app = await createAPI();
    response = await request(app)
      .post(`/user`)
      .send(validUserData);
  });

  test(`Status code 201`, () => expect(response.statusCode).toBe(HttpCode.CREATED));

});

describe(`API refuses to create user if data is invalid`, () => {
  const validUserData = {
    name: `Grigoriy`,
    surname: `Dushkevich`,
    email: `newuser@yahoo.com`,
    password: `122345qwerty`,
    passwordRepeated: `122345qwerty`,
    avatar: `default.jpg`
  };

  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`Without any required property response code is 400`, async () => {
    const NOT_REQUIRED_KEY = `avatar`;
    const validData = {...validUserData};
    delete validData[NOT_REQUIRED_KEY];
    for (const key of Object.keys(validData)) {
      const badUserData = {...validData};
      delete badUserData[key];
      await request(app)
        .post(`/user`)
        .send(badUserData)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When field type is wrong response code is 400`, async () => {
    const badUsers = [
      {...validUserData, email: 1}
    ];
    for (const badUserData of badUsers) {
      await request(app)
        .post(`/user`)
        .send(badUserData)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When field value is wrong response code is 400`, async () => {
    const badUsers = [
      {...validUserData, password: `short`, passwordRepeated: `short`},
      {...validUserData, email: `invalid`}
    ];
    for (const badUserData of badUsers) {
      await request(app)
        .post(`/user`)
        .send(badUserData)
        .expect(HttpCode.BAD_REQUEST);
    }
  });

  test(`When password and passwordRepeated are not equal, code is 400`, async () => {
    const badUserData = {...validUserData, passwordRepeated: `122345qwerty_`};
    await request(app)
      .post(`/user`)
      .send(badUserData)
      .expect(HttpCode.BAD_REQUEST);
  });

  test(`When email is already in use status code is 400`, async () => {
    const badUserData = {...validUserData, email: `test2@google.ru`};
    await request(app)
      .post(`/user`)
      .send(badUserData)
      .expect(HttpCode.BAD_REQUEST);
  });
});

describe(`API authenticate user if data is valid`, () => {
  const validAuthData = {
    email: `test2@google.ru`,
    password: `egorov`
  };

  let response;

  beforeAll(async () => {
    const app = await createAPI();
    response = await request(app)
      .post(`/user/auth`)
      .send(validAuthData);
  });

  test(`Status code is 200`, () => expect(response.statusCode).toBe(HttpCode.OK));

  test(`User's surname is Egorov`, () => expect(response.body.surname).toBe(`Egorov`));
});

describe(`API refuses to authenticate user if data is invalid`, () => {
  let app;

  beforeAll(async () => {
    app = await createAPI();
  });

  test(`If email is incorrect status is 401`, async () => {
    const badAuthData = {
      email: `not_existing@mail.com`,
      password: `not_existing_pass`
    };

    await request(app)
      .post(`/user/auth`)
      .send(badAuthData)
      .expect(HttpCode.UNAUTHORIZED);
  });

  test(`If password doesn't match status is 401`, async () => {
    const badAuthData = {
      email: `test1@ya.ru`,
      password: `egorov`
    };

    await request(app)
      .post(`/user/auth`)
      .send(badAuthData)
      .expect(HttpCode.UNAUTHORIZED);
  });
});
