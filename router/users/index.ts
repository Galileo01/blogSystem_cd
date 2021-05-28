import Router from '@koa/router'
const router = new Router({
  prefix: '/user'
})
router.get('/test', (ctx, next) => {

})

export default router