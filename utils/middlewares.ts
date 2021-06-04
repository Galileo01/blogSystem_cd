import Koa from 'koa';
import { logger } from './logger';
import jwt from 'jsonwebtoken';
import tokenConfig from '../config/token'
//日志 中间件
export async function logerMid(ctx: Koa.Context, next: Koa.Next) {
  const { url, header, method, status } = ctx;
  const { origin } = header;
  const before = new Date().getTime();
  await next();
  const after = new Date().getTime();
  logger.info(`${method} URL:${url} STATUS:${ctx.response.status} ORIGIN:${origin} TIME:${after - before}ms`);
}

//错误处理  中间件
export async function errMid(ctx: Koa.Context, next: Koa.Next) {
  try {
    await next();//等待 业务路由处理  若抛出错误
  }
  catch (err) {
    logger.error(`ERROR ${err}`);
    ctx.response.status = 500;//状态码强制设置为 500
    ctx.body = {
      success: 0,
      errCode: 500,
      data: err + ''
    }
  }
}
//token 解析中间件
export async function tokenMid(ctx: Koa.Context, next: Koa.Next) {
  //解析token  存在 请求头
  if (ctx.header?.authorization) {
    const userInfoInToken = jwt.verify(ctx.header?.authorization?.slice(7) || '', tokenConfig.secret);
    ctx.state.userInfoInToken = userInfoInToken;
  }
  await next();
}
