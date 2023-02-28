const pruebaUser = (req,res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador user"
    })
}

module.exports = {
    pruebaUser
}