const User = require("../models/User")
const bcrypt = require("bcrypt")



const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador user"
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
                message: "Accion de registro de usuarios",
                user
            })

        })

        // Registro de usuarios


    })


}

module.exports = {
    pruebaUser,
    register
}