const express = require("express")
const router = express.Router()
const multer = require("multer")

const UserController = require("../controllers/user.controller")
const check = require("../middlewares/auth")
//Configuracion de subida

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars")
    },
    filename:(req, file, cb) => {
        cb(null, "avatar-"+ Date.now()+"-"+file.originalname)
    }
})

const uploads = multer({storage})

//definir rutas

router.get("/prueba-usuario",check.auth, UserController.pruebaUser)
router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.get("/profile/:id",check.auth, UserController.profile)
router.get("/list/:page?",check.auth, UserController.list)
router.patch("/update", check.auth, UserController.update)
router.post("/upload", [check.auth, uploads.single("file0")], UserController.upload)
router.get("/avatar/:file", check.auth, UserController.avatar)

module.exports = router