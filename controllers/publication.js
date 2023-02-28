const pruebaPublication = (req,res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde el controlador publication"
    })
}

module.exports = {
    pruebaPublication
}