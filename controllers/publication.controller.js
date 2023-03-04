const Publication = require("../models/publication")

const pruebaPublication = (req,res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador publication"
    })
}

//Guardar publicacion

//Obtener publicacion

//eliminar publicacion

//listar todas las publicaciones

//listar las publicaciones de un usuario

//subir ficheros

//Devolver archivos multimedia

module.exports = {
    pruebaPublication
}