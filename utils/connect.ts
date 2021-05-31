import mysql from 'mysql'
import mysqlConfig from '../config/mysql';
import { logger } from './logger'
//复用 链接池子
function getQuery() {
    //创建连接池
    const pool = mysql.createPool({
        ...mysqlConfig,
        connectionLimit: 10,
        host: 'localhost', //数据库地址
        multipleStatements: true, //允许执行多条语句
    });
    console.log('create pool');
    return <T>(sql: string) => {
        return new Promise<T>((resolve, reject) => {
            //从连接池 中获取一个连接
            pool.getConnection((err, connect) => {
                if (err) reject(err);
                else {
                    logger.info('获取连接');
                    connect.query(sql, (err, rows) => {
                        if (err) reject(err);
                        else {
                            resolve(rows);
                        }
                        connect.release(); //释放连接
                    });
                }
            });
        });
    }
}
//封装  每次查询都重新建立连接 并 保证连接关闭
export const query = getQuery();