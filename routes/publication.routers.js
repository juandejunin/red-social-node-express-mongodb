const express = require("express")
const router = express.Router()
const PublicationController = require("../controllers/publication.controller")

//definir rutas

router.get("/prueba-publication", PublicationController.pruebaPublication)

module.exports = router