/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-01-20 13:55:22
 * @Description: 
 */

import * as express from 'express'
import { parseToken, splitBearerToken } from './lib/utils/token'
import Config from './config'
import { router } from './router/index'
import { logger } from './lib/logger'
import { generateUUID } from './lib/utils/rand'
import { WebSocketAgent } from './lib/ws'
import { DatabaseAgent } from './lib/database'
import { SchedulerInstance } from './lib/scheduler'


/**
 * Just for generating declaration type files for `@/cloud-sdk` which used in cloud function
 */
export * from './cloud-sdk'

const app = express()
app.use(express.json() as any)
app.use(express.urlencoded({
  extended: true
}) as any)

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Caught unhandledRejection:`, reason, promise)
})

process.on('uncaughtException', err => {
  logger.error(`Caught uncaughtException:`, err)
})

/**
 * Parsing bearer token
 */
app.use(function (req, res, next) {
  const token = splitBearerToken(req.headers['authorization'] ?? '')
  const auth = parseToken(token) || null
  req['auth'] = auth

  const requestId = req['requestId'] = generateUUID()
  logger.info(requestId, `${req.method} "${req.url}" - referer: ${req.get('referer') || '-'} ${req.get('user-agent')}`)
  logger.trace(requestId, `${req.method} ${req.url}`, { body: req.body, headers: req.headers, auth })
  res.set('requestId', requestId)
  next()
})

app.use(router)

const server = app.listen(Config.PORT, () => logger.info(`server ${process.pid} listened on ${Config.PORT}`))

/**
 * WebSocket upgrade & connect
 */
server.on('upgrade', (req, socket, head) => {
  WebSocketAgent.server.handleUpgrade(req, socket as any, head, (client) => {
    WebSocketAgent.server.emit('connection', client, req)
  })
})


process.on('SIGTERM', gracefullyExit)
process.on('SIGINT', gracefullyExit)

async function gracefullyExit() {
  SchedulerInstance.destroy()
  await DatabaseAgent.accessor.close()
  server.close(async () => {
    logger.info('process gracefully exited!')
    process.exit(0)
  })
}