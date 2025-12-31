const express = require("express")
const router = express.Router()
const peopleModel = require("../models/people_model")

router.get('/', async (request, response) => {
    data = await peopleModel.get()
    response.json(data)
  })
router.post('/', async (request, response) => {
    data = await peopleModel.save(request)
    response.json(data)
})
router.get('/:uuid', async (request, response) => {
    data = await peopleModel.get_one(request)
    response.json(data)
})

router.put('/:uuid', async (request, response) => {
  data = await peopleModel.update(request)
  response.json(data)
})
router.delete('/:uuid', async (request, response) => {
  data = await peopleModel.delete(request)
  response.json(data)
})

module.exports = router