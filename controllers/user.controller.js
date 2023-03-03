const User = require("../models/User")
const bcrypt = require("bcrypt")
const mongoosePagination = require("mongoose-pagination")


//importar servicios
const jwt = require("../services/jwt")



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
        .exec((error, userProfile) => {
            if (error || !userProfile) {
                return res.status(404).send({
                    status: "error",
                    message: "Usuario no encontrado"
                })
            }
            //Devolver el resultado
            return res.status(200).send({
                status: "success",
                user: userProfile
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

    User.find().sort('_id').paginate(page, ItemsPerPage, (error, users, total) => {

        if (error || !users) {
            return res.status(404).send({
                status: "error",
                message: "No se encontraron usuarios",
                error
            })


        }

        //Devolver el resultado
        return res.status(200).send({
            status: "success",
            users,
            page,
            ItemsPerPage,
            total,
            pages: Math.ceil(total / ItemsPerPage)
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
        User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true }, (error, userToUpdate) => {

            if (error || !userToUpdate) {
                return res.status(500).json({ status: "error", message: " Error en la consulta" })
            }

            return res.status(200).send({
                status: "success",
                message: "Datos actualizados correctamente",
                user: userToUpdate
            })

        })

    })
}

const upload = (req,res) => {
    return res.status(200).send({
        status: "success",
        message: "Subida de imagenes",
        user: req.user,
        file: req.file,
        files: req.files
    })
}

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload
}