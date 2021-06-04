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

const userCommonInfo = 'Uid,role,name,email,tel,avatar,createTime';
//搜索 用户 
router.get('/search', async (ctx, next) => {
  const { name } = ctx.query;
  //不存在用户名 则查询所有
  const sql = `
  SELECT ${userCommonInfo}
  FROM user
  ${name ? `WHERE name LIKE "%${name}%"` : ''}
  `;
  const data = await query<SelectRes<USerSchema>>(sql);//模糊查询
  // console.log(data[0].Uid);
  ctx.body = {
    success: 1,
    data
  }
})
//用户注册
router.post('/register', async (ctx, next) => {
  const postData = ctx.request.body;//koa-bodyparser 中间件 解析并注入 到body
  const { username, password } = postData;
  //现在 数据库里查找 是否有 同名的
  const find = await query<SelectRes<USerSchema>>(`
  SELECT *
  FROM user
  WHERE name='${username}'
  `)
  if (find.length > 0) {
    ctx.body = {
      success: 0,
      data: '该用户名已被注册'
    }
    return;
  }
  //插入数据库 
  const data = await query<AffectedRes>(`
  INSERT INTO user
  VALUES(
    NULL,3,'${username}','${password}','','','',
    now(),''
  )
  `)
  // console.log(data);
  const { secret, expiresIn } = tokenConfig;
  // 注册同时下发 tonken
  const token = jwt.sign({
    username,
    Uid: data.insertId,
    role: 3
  }, secret, { expiresIn });

  ctx.body = {
    success: 1,
    data: {
      userInfo: { //返回 用户信息
        Uid: data.insertId, name: username, password,
        tel: 0,
        wid: '',
        avatar: '',
        createTime: Date.now().toString(),
        role: 3//默认 角色 3
      },
      token,
    }
  }
})
//用户登陆
router.post('/login', async (ctx, next) => {
  const { username, password } = ctx.request.body;
  const data = await query<SelectRes<USerSchema>>(`
    SELECT *
    FROM user
    WHERE name="${username}"`);
  // console.log(data);
  if (data.length === 0) {
    ctx.body = {
      success: 0,
      data: '用户不存在'
    }
  }
  else if (data[0].password !== password) {
    ctx.body = {
      success: 0,
      data: '用户名或者密码错误'
    }
  }
  else {
    const { secret, expiresIn } = tokenConfig;
    //   同时下发 tonken
    const token = jwt.sign({
      username: username,
      Uid: data[0].Uid,
      role: data[0].role
    }, secret, { expiresIn });
    data[0].password = '';//不返回  用户密码
    ctx.body = {
      success: 1,
      data: {
        userInfo: data[0],
        token
      }
    }
  }
})

//获取指定 Uid 的用户信息
router.get('/getByUid', async (ctx, next) => {
  const { Uid } = ctx.query;
  const result = await query<SelectRes<USerSchema>>(`
  SELECT ${userCommonInfo}
  FROM user
  WHERE Uid=${Uid}
  `)
  if (result.length === 0) {
    ctx.body = {
      success: 0, data: '非法Uid',
    }
  }
  else {
    ctx.body = {
      success: 1,
      data: result[0]
    }
  }
})


//根据 Uid删除 用户
router.post('/deleteByUid', async (ctx, next) => {
  const { Uid } = ctx.request.body;
  const userInfoInToken = ctx.state.userInfoInToken as USerSchema;
  console.log(ctx.state.userInfoInToken);
  //普通用户 不允许删除
  if (userInfoInToken.role === 3) {
    ctx.body = {
      success: 0,
      data: '没有权限'
    }
    return;
  }
  const data = await query<AffectedRes>(`
  DELETE FROM user
  WHERE Uid=${Uid}
  `)
  if (data.affectedRows === 1) {
    ctx.body = {
      success: 1,
      data: Uid
    }
  }
  else {
    ctx.body = {
      success: 0,
      data: '删除失败，核实Uid'
    }
  }
})


//更新角色
router.post('/setRoleByUid', async (ctx, next) => {
  const { Uid, role } = ctx.request.body;
  const userInfoInToken = ctx.state.userInfoInToken as USerSchema;
  console.log(ctx.state.userInfoInToken);
  //普通用户 不允许更新
  if (userInfoInToken.role === 3) {
    ctx.body = {
      success: 0,
      data: '没有权限'
    }
    return;
  }
  const data = await query<AffectedRes>(`
  UPDATE user
  SET
  role=${role}
  WHERE Uid=${Uid}
  `)
  if (data.affectedRows === 1) {
    ctx.body = {
      success: 1,
      data: Uid
    }
  }
  else {
    ctx.body = {
      success: 0,
      data: '更新失败，核实Uid'
    }
  }
})

export default router