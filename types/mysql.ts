//mysql 
export type SelectRes<T> = T[];
export interface AffectedRes {
  insertId: number,
  affectedRows: number,
  warningCount: number,
}