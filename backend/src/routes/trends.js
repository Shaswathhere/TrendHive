const express = require("express")
const { requireAuth } = require("../middleware/auth")

const { fetchRealTrends } = require("../services/trendService")

const router = express.Router()

router.get("/feed", requireAuth, async (request, response) => {
  const interests = request.query.interests ? request.query.interests.split(",") : []
  const items = await fetchRealTrends(interests)
  response.json({ items })
})

module.exports = router
