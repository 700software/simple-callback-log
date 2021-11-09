import { IncomingMessage, ServerResponse } from 'http'
import mysql from 'mysql2'
import type { Connection as PromiseConnection } from 'mysql2/promise.d'

export type SqlFunction =
  <T extends RowDataPacket[]>
    (sql: TemplateStringsArray, ...args: SqlParam[])
    => Promise<SqlFunResult<T>>

export type SqlFunResult<T extends RowDataPacket[]> = T & { affectedRows: number, insertId?: number }
export type SqlParam = string | number

/** from https://github.com/sidorares/node-mysql2/blob/HEAD/typings/mysql/lib/protocol/packets/RowDataPacket.d.ts */
declare interface RowDataPacket {
  [column: string]: any
  [column: number]: any
}

type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown
} ? U : T

/**
 * Features
 * - automatic SQL-injection protections. 
 * - automatic invoke of ensureTableChanges
 * @example
 * const sql = sqlFun(req, res)
 * await`select * from test where col=${param} limit ${param}`
 */
export default async function sqlFun(req: IncomingMessage, res: ServerResponse): Promise<SqlFunction> {
  const db = unsafeDb(req, res)

  return async function <T extends RowDataPacket[]>(template: TemplateStringsArray, ...args: SqlParam[]): Promise<SqlFunResult<T>> {
    const [rows, fields] = await db.query(template.join('?'), args)
    const result = rows as SqlFunResult<T>
    return result
  }
}

/** Only labeled unsafe, because it is possible to do SQL injection with this. */
export function unsafeDb(req: IncomingMessage, res: ServerResponse): PromiseConnection {
  const reqWithCache = req as typeof req & { dbCache?: PromiseConnection }
  if (reqWithCache.dbCache) return reqWithCache.dbCache

  var endO = res.end
  res.end = function () {
    if (reqWithCache.dbCache) {
      reqWithCache.dbCache.end()
      reqWithCache.dbCache = null
    }
    return endO.apply(this, arguments)
  }

  return reqWithCache.dbCache = mysql.createConnection({
    host: process.env.MYSQL_HOST || 'db.700s.net',
    database: process.env.MYSQL_DB || 'simple',
    user: process.env.MYSQL_USER || 'simple',
    password: process.env.MYSQL_PASS,
  }).promise()
}
