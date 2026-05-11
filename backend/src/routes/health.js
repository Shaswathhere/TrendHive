const express = require("express")

const router = express.Router()

router.get("/", (_request, response) => {
  response.json({
    status: "ok",
    service: "trendhive-backend",
    timestamp: new Date().toISOString(),
  })
})

module.exports = router
