/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-03 23:09:23
 * @LastEditTime: 2021-10-08 01:48:32
 * @Description: 
 */


import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { permissions } from '../../constants/permissions'
import { DatabaseAgent } from '../../lib/db-agent'

const { POLICY_REMOVE } = permissions

/**
 * Remove a policy by id
 */
export async function handleRemovePolicyById(req: Request, res: Response) {
  const db = DatabaseAgent.db
  const app: ApplicationStruct = req['parsed-app']
  const policy_id = req.params.policy_id

  // check permission
  const code = await checkPermission(req['auth']?.uid, POLICY_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  // do db query
  const ret = await db.collection(Constants.cn.policies)
    .deleteOne({
      _id: new ObjectId(policy_id),
      appid: app.appid
    })

  return res.send({
    data: ret
  })
}