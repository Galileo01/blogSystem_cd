import Router from '@koa/router';
import { SelectRes, AffectedRes } from '../types/mysql';
import { CommentSchema } from '../types/schema'
import { query } from '../utils/connect';
const router = new Router({
  prefix: '/comment'
})

//新建 评论
router.post('/add', async (ctx, next) => {
  const { Pid, content, username, replayCid } = ctx.request.body;
  const result = await query<AffectedRes>(`
    INSERT INTO comment
    VALUES(
      NULL,${Pid},${replayCid || 'NULL'},'${content}','${username}',now()
    )
    `);
  console.log(result);
  ctx.body = {
    success: 1,
    data: {
      Cid: result.insertId
    }
  }
})

//根据 Pid 获取 评论  并 按照时间排序
router.get('/getByPid', async (ctx, next) => {
  const { Pid } = ctx.query;
  const result = await query(`
    SELECT *
    FROM comment
    WHERE Pid=${Pid}
    ORDER BY commentTime DESC
    `);
  ctx.body = {
    success: 1,
    commentList: result
  }
})

//删除
router.post('/deleteByCid', async (ctx, next) => {
  const { Cid } = ctx.request.body;
  const result = await query<AffectedRes>(`
  DELETE FROM comment
  WHERE Cid =${Cid}`);
  if (result.affectedRows === 0) {
    ctx.body = {
      success: 0,
      msg: `不存在Cid = ${Cid} 评论`
    }
  }
  else {
    ctx.body = {
      success: 1,
      data: {
        Cid
      }
    }
  }
})

export default router;