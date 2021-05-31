import Router from '@koa/router';
import { translateSpecialChar } from '../utils/utils';
import { AffectedRes, SelectRes } from '../types/mysql'
import { PostSchema } from '../types/schema'
import { query } from '../utils/connect';
const router = new Router({
  prefix: '/post'
})
//创建 帖子
router.post('/add', async (ctx, next) => {
  const { title, type, keywords, content, desc } = ctx.request.body;
  const translated = translateSpecialChar(content, 'write');//转译特殊字符 写模式
  console.log(translated);
  const result = await query<AffectedRes>(`
    INSERT INTO post
    VALUES (
      NULL,'${title}',${type},'${keywords}','${desc}','${content}',now(),0,0
    )
    `)
  // console.log(result);
  ctx.body = {
    success: 1,
    data: {
      Pid: result.insertId
    }
  }
})

//通过 Pid 删除贴纸
router.post('/deleteByPid', async (ctx, next) => {
  const { Pid } = ctx.request.body;
  const result = await query<AffectedRes>(`
    DELETE FROM post
    where Pid=${Pid}
    `);
  // console.log(result);
  if (result.affectedRows === 0) {
    ctx.body = {
      success: 0,
      msg: `不存在 Pid = ${Pid} 的帖子`
    }
  }
  else {
    ctx.body = {
      success: 1,
    }
  }
})
//更新 帖子
router.post('/update', async (ctx, next) => {
  const { title, type, keywords, content, desc, Pid } = ctx.request.body;
  const result = await query<AffectedRes>(`
  UPDATE post
  SET
    title='${title}',
    type='${type}',
    keywords='${keywords}',
    post.desc='${desc}',
    content="${content}",
    updateTime=now()
  WHERE Pid=${Pid}
  `);
  //desc 和关键字 DESC 同名 
  console.log(result);
  if (result.affectedRows === 0) {
    ctx.body = {
      success: 0,
      msg: `不存在 Pid = ${Pid} 的帖子`
    }
  }
  else {
    ctx.body = {
      success: 1,
      data: {
        Pid
      }
    }
  }
})

//根据 关键词 查询 title 或者 关键词
router.get('/query', async (ctx, next) => {
  let { type, keyword, limit, offset, Pid } = ctx.query as NodeJS.Dict<string>;
  // console.log(ctx.query);

  const conditions = [];//查询条件
  // 帖子类型
  if (type && type !== 'all') conditions.push(`type=${type}`);
  //title 和keywords  desc 模糊查询
  if (keyword) conditions.push(`(title LIKE "%${keyword}%" 
  OR keywords LIKE "%${keyword}%" 
  OR post.desc LIKE "%${keyword}%")`);//括号保证 优先级

  //没有 查询 条件
  let result: SelectRes<{ Pid: number }>;//省略
  if (conditions.length === 0) {
    result = await query(`
    SELECT * 
    FROM post
    `)
  }
  else {
    result = await query(`
    SELECT *
    FROM post
    ${conditions.length > 0 ? 'where ' + conditions.join(' and ') : ''}
    `)
  }
  console.log(conditions.join(' and '), result);
  const total = result.length;
  let start = 0;
  (offset && limit) && (start = parseInt(offset, 10) * parseInt(limit, 10));
  const end = start + (limit ? parseInt(limit, 10) : total);
  const postList = result.slice(start, end);
  ctx.body = {
    success: 1,
    data: {
      total,
      postList
    }
  }
})

//获取所有的 帖子  
router.get('/getAll', async (ctx, next) => {
  const result = await query(`
  SELECT *
  FROM post
  ORDER BY updateTime DESC
  `)
  ctx.body = {
    success: 1,
    data: {
      postList: result
    }
  }
})


// //获取类型
// router.get('/getByType', async (ctx, next) => {

// })

//通过Pid 查询
router.get('/getByPid', async (ctx, next) => {
  const { Pid } = ctx.query;
  const result = await query<SelectRes<PostSchema>>(`
    SELECT *
    FROM post
    WHERE Pid=${Pid}
    `);
  if (result.length === 0) {
    ctx.body = {
      success: 0,
      msg: `不存在Pid=${Pid} 的帖子`
    }
  }
  else {
    ctx.body = {
      success: 1,
      data: {
        PostSchema: {
          ...result[0],
          content: translateSpecialChar(result[0].content, 'read')//从数据库 读取数据 转换 特殊字符
        }
      }
    }
  }
})

//!! 增加帖子的 阅读数量
router.post('/increReadCount', async (ctx, next) => {
  const { Pid } = ctx.query;
  const result = await query<AffectedRes>(`
    UPDATE post
    SET 
      readCount=readCount+1
    WHERE Pid=${Pid}
    `);
  console.log(result);
  if (result.affectedRows === 0) {
    ctx.body = {
      success: 1,
      msg: `不存在Pid=${Pid} 的帖子`,
    }
  }
  else {
    ctx.body = {
      success: 1,
      data: {
        Pid
      }
    }
  }
})

//新增点赞 数量
router.post('/increStarCount', async (ctx, next) => {
  const { Pid } = ctx.query;
  const result = await query<AffectedRes>(`
    UPDATE post
    SET 
      starCount=starCount+1
    WHERE Pid=${Pid}
    `);
  console.log(result);
  if (result.affectedRows === 0) {
    ctx.body = {
      success: 1,
      msg: `不存在Pid=${Pid} 的帖子`,
    }
  }
  else {
    ctx.body = {
      success: 1,
      data: {
        Pid
      }
    }
  }
})

export default router;