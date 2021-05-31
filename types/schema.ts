//用户信息 
export interface USerSchema {
  Uid: number,
  name: string,
  emial: string,
  tel: number,
  password: string,
  wid: string,
  createTime: number
}

export interface PostSchema {
  Pid: number,
  content: string,
}

export interface CommentSchema {
  Cid: number,
  content: string
}