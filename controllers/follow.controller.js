const pruebaFollow = (req,res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador follow"
    })
}

module.exports = {
    pruebaFollow
}