import Router from '@koa/router';
import jwt from 'jsonwebtoken';
import { SelectRes, AffectedRes } from '../types/mysql';
import { query } from '../utils/connect'
import tokenConfig from '../config/token'
import { USerSchema } from '../types/schema'
const router = new Router({
  prefix: '/user'
});
//测试 接口
router.get('/test', (ctx, next) => {
  const { params } = ctx.query;
  ctx.body = {
    test: params
  }
})

//搜索 用户 
router.get('/search', async (ctx, next) => {
  const { name } = ctx.query;
  const data = await query<SelectRes<USerSchema>>(`
    SELECT * FROM user
    WHERE name LIKE "%${name}%"
    `);//模糊查询
  // console.log(data[0].Uid);
  ctx.body = {
    success: 1,
    data
  }
})
//用户注册
router.post('/register', async (ctx, next) => {
  const postData = ctx.request.body;//koa-bodyparser 中间件 解析并注入 到body
  const { name, password, email, tel, wid } = postData;
  //插入是数据库 
  const data = await query<AffectedRes>(`
  INSERT INTO user
  VALUES(
    NULL,'${name}','${password}','${email}','${tel}','${wid}',
    now()
  )
  `)
  // console.log(data);
  const { secret, expiresIn } = tokenConfig;
  // 注册同时下发 tonken
  const token = jwt.sign({
    username: postData.name,
    userId: data.insertId
  }, secret, { expiresIn });

  ctx.body = {
    success: 1,
    data: {
      userID: data.insertId,
      token,
    }
  }
})
//用户登陆
router.post('/login', async (ctx, next) => {
  const { username, password } = ctx.request.body;
  const data = await query<SelectRes<{ password: string, Uid: number }>>(`
    SELECT password,Uid
    FROM user
    WHERE name="${username}"`);
  // console.log(data);
  if (data.length === 0) {
    ctx.body = {
      success: 0,
      msg: '用户不存在'
    }
  }
  else if (data[0].password !== password) {
    ctx.body = {
      success: 0,
      msg: '用户名或者密码错误'
    }
  }
  else {
    const { secret, expiresIn } = tokenConfig;
    //   同时下发 tonken
    const token = jwt.sign({
      username: username,
    }, secret, { expiresIn });

    ctx.body = {
      success: 1,
      data: {
        Uid: data[0].Uid,
        token
      }
    }
  }
})


export default router