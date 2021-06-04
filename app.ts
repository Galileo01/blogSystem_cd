import Koa from 'koa';
import router from './router';
import bodyParser from 'koa-bodyparser'
import koaJwt from 'koa-jwt';
import tokenConfig from './config/token';
import { logerMid, errMid, tokenMid } from './utils/middlewares';
import { withoutAUTH } from './config/authentication'
const app = new Koa();
//转换 解析并解析 post 参数 body
app.use(bodyParser());

//添加 日志 中间件
app.use(logerMid);

//添加 token 验证
app.use(koaJwt({ secret: tokenConfig.secret }).unless({
  path: withoutAUTH
}))
//添加错误处理中间件
app.use(errMid);
app.use(tokenMid);
//添加业务 路由
app.use(router.routes()).use(router.allowedMethods());


app.listen(8080, () => {
  console.log('server is running at 8080 ');
})