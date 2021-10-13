const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')

module.exports = (authMiddleware, authService, amqpService, db) => {
  const router = express.Router()

  /**
   * @openapi
   * /:
   *  get:
   *    description: Default route
   *    responses:
   *      200:
   *        description: OK
   */
  router.get('/', (req, res, next) => {
    res.send({message: 'Welcome to Todo API!'})
  })

  // Auth
  router.use('/', require('./auth')(authService))

  // Swagger Docs
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Backend Service',
        version: '1.0.0',
      },
    },
    apis: ['./src/routes/*.js'],
  }
  const swaggerSpec = swaggerJsdoc(options)
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  // All routes from this point will use the auth middleware
  router.use(authMiddleware)

  router.use('/todos', require('./todos')(db))
  router.use('/items', require('./items')(db))
  router.use('/actls', require('./actls')(db))
  router.use('/actlq', require('./actlq')(amqpService))

  return router
}
