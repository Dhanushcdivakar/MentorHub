import configLib from 'config';
import dotenv from 'dotenv';
dotenv.config();

const servicesConfig = configLib.get('services');

export const config = {
  port: process.env.PORT || configLib.get('port'),

  jwtSecret: process.env.JWT_SECRET,

  services: {
    auth: process.env.SERVICE_AUTH_URL || process.env.AUTH_SERVICE_URL || servicesConfig.auth,
    users: process.env.SERVICE_USERS_URL || process.env.USER_SERVICE_URL || process.env.USERS_SERVICE_URL || servicesConfig.users,
    mentorship: process.env.SERVICE_MENTORSHIP_URL || process.env.MENTORSHIP_SERVICE_URL || servicesConfig.mentorship,
    books: process.env.SERVICE_BOOKS_URL || process.env.BOOKS_SERVICE_URL || servicesConfig.books,
  },
};
