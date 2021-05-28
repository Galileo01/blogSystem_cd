import Koa from 'koa';
import router from './router'
const app = new Koa();
app.use(router.routes()).use(router.allowedMethods())
app.listen(8080, () => {
  console.log('server is running at 8080 ');

})