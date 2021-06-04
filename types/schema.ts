//用户信息 
export interface USerSchema {
  Uid: number,
  name: string,
  role: number,
  emial: string,
  tel: number,
  password: string,
  wid: string,
  avatar: string;
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