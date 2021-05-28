import Router from '@koa/router'
import user from './users'
const router = new Router();
router.use(user.routes(), user.allowedMethods())
export default router;
