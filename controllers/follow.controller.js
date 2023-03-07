const mongoosePaginate = require("mongoose-pagination")

const Follow = require("../models/follow")
const User = require("../models/user")

//Importar servicios
const followService = require("../services/followService")

const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador follow"
    })
}

// Accion de guardar un follow (accion de seguir)
const save = (req, res) => {
    //Conseguir datos por body
    const parametros = req.body


    //sacar id del usuario identificado
    const identity = req.user

    //crear un objeto con modelo follow
    let userToFollow = new Follow({
        user: identity.id, //el uduario que va a seguir a otro usuario
        followed: parametros.followed
    })



    //guardar el objeto en la base de datos

    userToFollow.save((error, followStored) => {

        if (error || !followStored) {
            return res.status(500).send({
                status: "error",
                message: "No se pudo seguir al usuario"
            })

        }

        return res.status(200).send({
            status: "success",
            identity: req.user,
            followStored
        })

    })


}

// Accion de borrar un follow (accion de dejar seguir)
const unfollow = (req, res) => {

    //Obtener el id del usuario identificado
    const userId = req.user.id
    //Obtener el id del usuario que quierdo dejar de seguir
    const followedId = req.params.id

    //Find de las coincidencias y hacer remove
    Follow.find({
        "user": userId,
        "followed": followedId
    }).remove((error, followDelete) => {
        if (error || !followDelete) {
            return res.status(500).send({
                status: "error",
                message: "No se dejo de seguir al usuario"

            })
        }

        return res.status(200).send({
            status: "success",
            message: "Follow eliminado correctamente",
            identity: req.user,
            followDelete
        })
    })
}

//accion de listado de usuarios que un usuario esta siguiendo
const following = (req, res) => {
    //Obtener el ide del usuario identificado
    let userId = req.user.id

    //comprobar si me llega el id por parametro url
    if (req.params.id) userId = req.params.id

    //Comprobar si me llega la pagina, si no cargar la pagina 1
    let page = 1
    if (req.params.page) page = req.params.page


    //Definir cuantos usuarios por pagina quiero mostrar
    const itemsPerPage = 5

    //Finf o follow. Popular datos de los usuarios y paginarcon mongoose paginate
    Follow.find({ user: userId })
        .populate("user followed", " -password -email -role -__v")
        .paginate(page, itemsPerPage, async (error, follows, total) => {


            //Ver que usuarios que siguen a otro usuario me siguen a mi
            let followUserIds = await followService.followUserIds(req.user.id)
            return res.status(200).send({
                status: "success",
                message: "Accion following",
                follows,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers

            })

        })




}

//accion de listado de usuarios que me siguen a un usuario
const followers = (req, res) => {

    //Obtener el ide del usuario identificado
    let userId = req.user.id

    //comprobar si me llega el id por parametro url
    if (req.params.id) userId = req.params.id

    //Comprobar si me llega la pagina, si no cargar la pagina 1
    let page = 1
    if (req.params.page) page = req.params.page


    //Definir cuantos usuarios por pagina quiero mostrar
    const itemsPerPage = 5

    Follow.find({ followed: userId })
        .populate("user followed", " -password -role -email -__v")
        .paginate(page, itemsPerPage, async (error, follows, total) => {            
            let followUserIds = await followService.followUserIds(req.user.id)
            return res.status(200).send({
                status: "success",
                message: "Usuarios que me siguen",
                follows,
                total,
                pages: Math.ceil(total / itemsPerPage),
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers

            })

        })

}




module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers

}