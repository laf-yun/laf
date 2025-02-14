/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-03 23:09:23
 * @LastEditTime: 2021-10-08 01:40:46
 * @Description: 
 */


import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { permissions } from '../../constants/permissions'
import { DatabaseAgent } from '../../lib/db-agent'

const { FUNCTION_REMOVE } = permissions

/**
 * Remove a function by id
 */
export async function handleRemoveFunctionById(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: ApplicationStruct = req['parsed-app']
  const func_id = req.params.func_id

  // check permission
  const code = await checkPermission(req['auth']?.uid, FUNCTION_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // do db query
  const ret = await db.collection(Constants.cn.functions)
    .deleteOne({
      _id: new ObjectId(func_id),
      appid: app.appid,
      status: 0
    })

  return res.send({
    data: ret
  })
}