const express = require("express")
const router = express.Router()
const UserController = require("../controllers/user.controller")
const check = require("../middlewares/auth")
//definir rutas

router.get("/prueba-usuario",check.auth, UserController.pruebaUser)
router.post("/register", UserController.register)
router.post("/login", UserController.login)


module.exports = router