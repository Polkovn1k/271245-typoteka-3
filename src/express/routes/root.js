'use strict';

const asyncHandler = require(`express-async-handler`);
const csrf = require(`csurf`);
const upload = require(`../middlewares/upload.js`);
const {prepareErrors} = require(`../../utils.js`);
const {getAPI} = require(`../api.js`);
const {Router} = require(`express`);
const rootRouter = new Router();
const csrfProtection = csrf();

const PUBLICATIONS_PER_PAGE = 8;
const MOST_DISCUSSED_ARTICLES_QUANTITY = 4;
const ADMIN_ID = 1;
const api = getAPI();

rootRouter.get(`/`, asyncHandler(async (req, res) => {
  const {user} = req.session;

  let {page = 1} = req.query;
  page = +page;

  const limit = PUBLICATIONS_PER_PAGE;

  const offset = (page - 1) * PUBLICATIONS_PER_PAGE;

  const [
    {count, articles},
    categories
  ] = await Promise.all([
    api.getArticles({limit, offset}),
    api.getCategories(true)
  ]);

  const totalPages = Math.ceil(count / PUBLICATIONS_PER_PAGE);

  const articlesWithComments = await api.getArticles({
    comments: true,
  });
  let mostDiscussedArticles = articlesWithComments.sort((a, b) => b.comments.length - a.comments.length).splice(0, MOST_DISCUSSED_ARTICLES_QUANTITY);

  res.render(`welcome/welcome`, {articles, page, totalPages, categories, user, mostDiscussedArticles});
}));

rootRouter.get(`/register`, csrfProtection, (req, res) => {
  const {user} = req.session;

  res.render(`join/register`, {user, csrfToken: req.csrfToken()});
});

rootRouter.post(`/register`, upload.single(`avatar`), csrfProtection, asyncHandler(async (req, res) => {
  const {body, file} = req;
  const {name, surname, email, password} = req.body;
  const userData = {
    name,
    surname,
    email,
    password,
    passwordRepeated: body[`repeat-password`],
    avatar: file ? req.file.filename : ``,
  };

  try {
    await api.createUser({data: userData});
    res.redirect(`/login`);
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    res.render(`join/register`, {validationMessages, csrfToken: req.csrfToken()});
  }
}));

rootRouter.get(`/login`, csrfProtection, (req, res) => {
  const {user} = req.session;

  res.render(`join/login`, {user, csrfToken: req.csrfToken()});
});

rootRouter.post(`/login`, csrfProtection, asyncHandler(async (req, res) => {
  const {email, password} = req.body;

  try {
    const user = await api.auth({email, password});

    req.session.user = {
      ...user,
      admin: user.id === ADMIN_ID,
    };
    req.session.save(() => {
      res.redirect(`/`);
    });
  } catch (errors) {
    const validationMessages = prepareErrors(errors);
    const {user} = req.session;

    res.render(`join/login`, {user, validationMessages, csrfToken: req.csrfToken()});
  }
}));

rootRouter.get(`/logout`, (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect(`/`);
    });
  }
});

rootRouter.get(`/search`, asyncHandler(async (req, res) => {
  const {user} = req.session;
  const {query} = req.query;
  const queryExist = typeof query !== `undefined`;

  try {
    const results = await api.search(query);
    res.render(`search/search`, {results, queryExist, user});
  } catch (err) {
    res.render(`search/search`, {results: [], queryExist, user});
  }
}));

module.exports = rootRouter;
