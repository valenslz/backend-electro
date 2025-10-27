require('dotenv').config();

const ENV = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET,
  MP_ACCESS_TOKEN:"APP_USR-2306384043844868-102502-1c7ecb90f95e964a303d421a1729a2e1-2946100732",
  EMAIL_USER: "brayanama987@gmail.com",
  EMAIL_PASSWORD: "fbvpwujqualesswj",
  EMAIL_FROM: "ElectroMarket <electromarketu@gmail.com>"
};

module.exports = ENV;
