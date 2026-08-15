import configLib from 'config';
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || configLib.get('port'),

  jwtSecret: process.env.JWT_SECRET,

  services: configLib.get('services'),
};
