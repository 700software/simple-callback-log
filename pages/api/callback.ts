import { NextApiRequest, NextApiResponse } from 'next'
import sqlFun from '../../lib/sql'

export default async function (req: NextApiRequest, res: NextApiResponse) {

  if (req.method != 'POST')
    return res.status(405).setHeader('Allow', 'POST').end('Just POST a JSON body to get it logged.')

  const sql = await sqlFun(req, res)
  try {
    await insert()
  } catch (e) {
    if (e.code == 'ER_NO_SUCH_TABLE') {
      await sql`create table callback_received (id int key auto_increment, stamp timestamp(3) not null default current_timestamp(3), headers json not null, body json not null)`
      await insert()
    } else
      throw e
  }
  res.end('Thanks!')
  async function insert() {
    await sql`insert into callback_received (headers, body) values (${JSON.stringify(req.headers)}, ${JSON.stringify(req.body)})`
  }
}
