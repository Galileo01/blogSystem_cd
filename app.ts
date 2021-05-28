import Koa from 'koa'
const app = new Koa();
app.use((ctx, next) => {
  ctx.body = 'hello word'
})
app.listen(8080, () => {
  console.log('server is running at 8080 ');

})