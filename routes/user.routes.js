const express = require("express")
const router = express.Router()
const UserController = require("../controllers/user.controller")

//definir rutas

router.get("/prueba-usuario", UserController.pruebaUser)
router.post("/register", UserController.register)

module.exports = router