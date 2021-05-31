import Router from '@koa/router';
import user from './user';
import post from './post';
import comment from './comments'
const router = new Router();
router.use(user.routes(), user.allowedMethods());
router.use(post.routes(), post.allowedMethods());
router.use(comment.routes(), comment.allowedMethods());
export default router;
