//Importar modulos
const fs = require("fs")
const path = require("path")
const { create } = require("../models/publication")


const Publication = require("../models/publication")
const user = require("../models/user")

//importar servicios
const followService = require("../services/followService")


const pruebaPublication = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador publication"
    })
}

//Guardar publicacion
const save = (req, res) => {

    //Recoger datos del body
    const params = req.body

    //Si no llegan retornar respuesta negativa
    if (!params.text) {
        return res.status(400).send({
            status: "error",
            message: "Debes enviar el texto de la publicacion"
        })
    }

    //Crear y rellenar el objeto del modelo
    let newPublication = new Publication(params)
    newPublication.user = req.user.id


    //Guardar el objeto en bbdd
    newPublication.save((error, publicationStored) => {
        if (error || !publicationStored) {
            return res.status(400).send({
                status: "error",
                message: "No se guardo la publicacion"
            })
        }

        //Devolver respuesta

        return res.status(200).send({
            status: "success",
            message: "Publicacion guardada",
            publicationStored
        })
    })



}

//Obtener publicacion
const detail = (req, res) => {
    //Sacar el id de la publicacion de la url
    const publicationId = req.params.id
    //Buscar por id
    Publication.findById(publicationId, (error, publicationStored) => {
        if (error || !publicationStored) {
            return res.status(404).send({
                status: "error",
                message: "No se encontro la publicacion"
            })
        }

        //devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "detail",
            publication: publicationStored

        })
    })



}

//eliminar publicacion
const remove = (req, res) => {

    //Obtener el id de la publicacion que se quiere eliminar
    const publicacionId = req.params.id

    //Buscar y borrar (solo publicaciones que creo el usuario autenticado)
    Publication.find({ "user": req.user.id, "_id": publicacionId }).remove(error => {
        if (error) {
            return res.status(500).send({
                status: "error",
                message: "No se ha eliminado la publicacion"
            })
        }

        //devolver la respuesta
        return res.status(200).send({
            status: "success",
            message: "Publicacion eliminada",
            publication: publicacionId

        })
    })


}

//listar todas las publicaciones
const publicationUser = (req, res) => {
    //Sacar id usuario
    const userId = req.params.id
    //Controlar la pagina
    let page = 1

    if (req.params.page) {
        page = req.params.page
    }
    const itemsPerPage = 5

    //Buscar, populate, ordenar, paginar
    Publication.find({ "user": userId })
        .sort("-created_at")
        .populate('user', "-password -__v -role -email")
        .paginate(page, itemsPerPage, (error, publications, total) => {
            if (error || publications.length <= 0) {
                return res.status(400).send({
                    status: "error",
                    message: "No se ha encontrado la publicacion"
                })

            }

            //devolver la respuesta
            return res.status(200).send({
                status: "success",
                message: "Listado de Publicacion",
                page,
                total,
                pages: Math.ceil(total / itemsPerPage),
                publications,

            })

        })

}
//subir ficheros
const upload = (req, res) => {
    // Obtener publication id
    const publicationId = req.params.id
    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Peticion no incluye la imagen"
        })
    }

    //Conseguir el nombre del archivo
    let image = req.file.originalname.toLowerCase()

    //Sacar la extension del archivo
    const imageSplit = image.split("\.")
    const extension = imageSplit[1]

    // Comprobar la extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {
        const filePath = req.file.path
        //Si no es correcto, borrar el archivo
        const filePathDelete = fs.unlinkSync(filePath)
        //devolver respuesta
        return res.status(400).send({
            status: "error",
            message: "Formato del archivo invalido"
        })
    }

    //Si es correcto guardar la imagen en bbdd
    Publication.findByIdAndUpdate({ "user": req.user.id, "_id": publicationId }, { file: req.file.filename }, { new: true }, (error, publicationUpdate) => {
        if (error || !publicationUpdate) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida del avatar"
            })

        }
        //devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Subida de imagenes",
            uspublication: publicationUpdate,
            file: req.file,


        })
    })
}

//Devolver archivos multimedia
const media = (req, res) => {
    //Sacar el parametro de la url
    const file = req.params.file

    //Montar el path de la imagen
    const filePath = "./uploads/publications/" + file

    //Comprobar que existe
    fs.stat(filePath, (error, exists) => {
        if (!exists) return res.status(400).send({
            status: "error",
            message: "Error al buscar el archivo"
        })

        //Devolver un file
        return res.sendFile(path.resolve(filePath))
    })


}

//listar las publicaciones de un usuario
const feed = async (req, res) => {
    //Obtener pagina actual
    let page = 1

    if (req.params.page) {
        page = req.params.page

    }

    //Establecer numero de elementos por pagina
    let itemsPerPage = 5


    try {
        //Sacar un array limpio de identificadores de usuarios que yo sigo como usuario identificado
        const myFollows = await followService.followUserIds(req.user.id)

        // Buscar publicaciones in, ordenar, popular , paginar
        const publications = await Publication.find({ user: myFollows.following })
            .populate("user","-password -role -__v -email")
            .sort("-created_at")
            
            .paginate(page, itemsPerPage)

        return res.status(200).send({
            status: "success",
            message: "Fedd",
            following: myFollows.following,
            publications
        })

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No se han listado las publicaciones del Feed",

        })
    }


    return res.status(200).send({
        status: "success",
        message: "Fedd",

    })

}




//Exportar acciones
module.exports = {
    pruebaPublication, save, detail, remove, publicationUser, upload, media, feed
}