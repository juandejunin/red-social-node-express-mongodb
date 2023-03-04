const User = require("../models/user")
const bcrypt = require("bcrypt")
const mongoosePagination = require("mongoose-pagination")
const fs = require("fs")
const path = require("path")

//importar servicios
const jwt = require("../services/jwt")
const followService = require("../services/followService")




const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador user",
        usuario: req.user

    })
}


const register = (req, res) => {

    // recoger datos de la peticion
    let params = req.body

    // comprobar que me llegan bien validacion
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos que son obligatorios"
        })
    }


    //control de usuarios duplicados
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {
        if (error) return res.status(500).json({ status: "error", message: " Error en la consulta" })

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe"
            })
        }
        //cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10)
        params.password = pwd

        // Guardar informacion del nuevo usuario
        let user = new User(params)

        //guardar en la bbdd
        user.save((error, userStored) => {
            if (error || !userStored) return res.status(500).send({
                status: "error",
                message: "Error al guardar el usuario"
            })
            //devolver el resultado
            return res.status(200).json({
                status: "success",
                message: "Usuario registrado exitosamente",

            })

        })

        // Registro de usuarios


    })


}

const login = (req, res) => {
    // Recoger parametros que lleguen en la peticion
    let params = req.body

    if (!params.email || !params.password) {
        return res.status(404).send({
            status: "error",
            message: "faltan datos por enviar"
        })
    }

    //BUscar en la base de datos
    User.findOne({ email: params.email })
        // .select({ "password": 0 })
        .exec((error, user) => {
            if (error || !user) return res.status(404).send({
                status: "error",
                message: "No se encuentra el usuario"
            })

            //Comprobar la contraseña
            let pwd = bcrypt.compareSync(params.password, user.password)

            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    message: "No te identificaste correctamente"
                })
            }

            //Devolver token
            const token = jwt.createToken(user)

            //Devolver datos de usuario
            return res.status(200).send({
                status: "success",
                message: "accion de login",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
            })

        })
}

const profile = (req, res) => {
    //Recibit el parametro del id de usuario por url
    const id = req.params.id

    //Consulta para obtener los datos del usuario
    User.findById(id,)
        .select({ password: 0, role: 0 })
        .exec(async (error, userProfile) => {
            if (error || !userProfile) {
                return res.status(404).send({
                    status: "error",
                    message: "Usuario no encontrado"
                })
            }

            //Obtener informacion de seguimiento
            const followInfo = await followService.followThisUser(req.user.id, id)
            //Devolver el resultado
            return res.status(200).send({
                status: "success",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
            })
        })


}

const list = (req, res) => {

    //Controlar en que pagina estamos
    let page = 1

    if (req.params.page) {
        page = req.params.page
    }
    page = parseInt(page)

    // Consulta con mongoose paginate

    let ItemsPerPage = 5

    User.find().sort('_id').paginate(page, ItemsPerPage, async (error, users, total) => {

        if (error || !users) {
            return res.status(404).send({
                status: "error",
                message: "No se encontraron usuarios",
                error
            })


        }
        //Ver que usuarios que siguen a otro usuario me siguen a mi
        let followUserIds = await followService.followUserIds(req.user.id)

        //Devolver el resultado
        return res.status(200).send({
            status: "success",
            users,
            page,
            ItemsPerPage,
            total,
            pages: Math.ceil(total / ItemsPerPage),
            user_following: followUserIds.following,
            user_follow_me : followUserIds.followers
        })

    })








}

const update = (req, res) => {
    //Recoger la informacion del usuario a actualizar
    const userIdentity = req.user
    const userToUpdate = req.body
    //eliminar campos sobrantes
    delete userToUpdate.iat
    delete userToUpdate.exp
    delete userToUpdate.role
    //Comprobar si el usuario existe
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    }).exec(async (error, users) => {
        if (error) return res.status(500).json({ status: "error", message: " Error en la consulta" })


        let userIsset = false

        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true

        })
        if (userIsset) {
            return res.status(200).send({
                status: "success",
                message: "Acceso denegado"
            })
        }
        //Si me llega la pasword cifrarla
        //cifrar la contraseña
        if (userToUpdate.password) {
            let pwd = await bcrypt.hash(userToUpdate.password, 10)
            userToUpdate.password = pwd
        }

        //Buscar y actualizar
        try {
            let userUpdate = await User.findByIdAndUpdate({ _id: userIdentity.id }, userToUpdate, { new: true })

            if (!userToUpdate) {
                return res.status(404).json({ status: "error", message: " Error en la consulta" })
            }

            return res.status(200).send({
                status: "success",
                message: "Datos actualizados correctamente",
                user: userUpdate
            })


        } catch (error) {
            return res.status(500).json({ status: "error", message: " Error en la consulta" })
        }



    })
}

const upload = (req, res) => {

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
    User.findByIdAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true }, (error, userUpdate) => {
        if (error || !userUpdate) {
            return res.status(500).send({
                status: "error",
                message: "Error en la subida del avatar"
            })

        }
        //devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Subida de imagenes",
            user: userUpdate,
            file: req.file,


        })
    })
}

const avatar = (req, res) => {
    //Sacar el parametro de la url
    const file = req.params.file

    //Montar el path de la imagen
    const filePath = "./uploads/avatars/" + file

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

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}