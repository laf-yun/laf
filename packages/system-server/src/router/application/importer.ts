/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-09-09 14:46:44
 * @LastEditTime: 2022-02-05 23:46:59
 * @Description:
 */

import fsp = require('fs/promises')
import { Request, Response } from 'express'
import {
  getApplicationByAppid,
  publishApplicationPackages,
} from '../../api/application'
import { publishFunctions } from '../../api/function'
import { checkPermission } from '../../api/permission'
import { publishAccessPolicies } from '../../api/policy'
import { Constants } from '../../constants'
import { ApplicationImporter } from '../../lib/importer'
import { logger } from '../../lib/logger'
import { DatabaseAgent } from '../../lib/db-agent'
import { Binary, ObjectId } from 'mongodb'

const { APPLICATION_ADD } = Constants.permissions

/**
 * The handler of import application by id
 * @param req
 * @param res
 * @returns
 */
export async function handleImportApplication(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app) return res.status(422).send('invalid appid')
  const file = req.file
  if (!file) return res.status(422).send('import file cannot be empty')

  // check permission
  const code = await checkPermission(uid, APPLICATION_ADD.name, app)
  if (code) return res.status(code).send()

  try {
    const data = await fsp.readFile(file.path)
    const importer = new ApplicationImporter(app, data)

    importer.parse()
    await importer.import()

    await publishFunctions(app)
    await publishAccessPolicies(app)
    await publishApplicationPackages(app.appid)
    return res.send({ data: 'ok' })
  } catch (error) {
    logger.error('import application got error:', error)
    return res.status(500).send({ error: 'import application got error' })
  }
}

export async function handleInitApplicationWithTemplate(
  req: Request,
  res: Response
) {
  const uid = req['auth']?.uid
  const appid = req.params.appid
  const template_id = req.body?.template_id
  if (!template_id) return res.status(422).send('template_id missing')

  const app = await getApplicationByAppid(appid)
  if (!app) return res.status(422).send('invalid appid')

  // check permission
  const code = await checkPermission(uid, APPLICATION_ADD.name, app)
  if (code) return res.status(code).send()

  const coll = DatabaseAgent.db.collection(Constants.cn.app_templates)
  try {
    const template = await coll.findOne({
      _id: new ObjectId(req.body?.template_id),
    })
    if (!template) return res.status(422).send('invalid template_id')

    const bin = template.package?.data as Binary
    const importer = new ApplicationImporter(app, bin.buffer)
    importer.parse()
    await importer.import()

    await publishFunctions(app)
    await publishAccessPolicies(app)
    await publishApplicationPackages(app.appid)
    return res.send({ data: 'ok' })
  } catch (error) {
    logger.error('init application got error:', error)
    return res.status(500).send({ error: 'init application got error' })
  }
}
