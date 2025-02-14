/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-11-13 17:42:16
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { Constants } from '../../constants'
import { StorageAgent } from '../../api/storage'
import { DatabaseAgent } from '../../lib/db-agent'

/**
 * The handler of deleting a bucket
 */
export async function handleDeleteBucket(req: Request, res: Response) {
  const bucketName = req.params?.bucket

  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const { FILE_BUCKET_REMOVE } = Constants.permissions
  const code = await checkPermission(uid, FILE_BUCKET_REMOVE.name, app)
  if (code) {
    return res.status(code).send()
  }

  const st = new StorageAgent()
  const internalName = `${app.appid}_${bucketName}`
  const ret = await st.deleteBucket(internalName)
  if (ret?.code === 'BUCKET_NOT_EMPTY') {
    return res.send(ret)
  }

  // delete bucket from app
  await DatabaseAgent.db.collection<ApplicationStruct>(Constants.cn.applications)
    .updateOne({ appid: app.appid }, {
      $pull: {
        buckets: { name: bucketName }
      }
    })

  return res.send({
    code: 0,
    data: bucketName
  })
}