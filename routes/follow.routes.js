const express = require("express")
const router = express.Router()
const FollowController = require("../controllers/follow")

//definir rutas

router.get("/prueba-follow",FollowController.pruebaFollow)

module.exports = router