import Koa from 'koa';
import { logger } from './logger';
import jwt from 'jsonwebtoken';
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
    ctx.body = {
      success: 0,
      errCode: 500,
      msg: err + ''
    }
  }
}