//importar dependencias
const connection = require("./database/connection")
const express = require("express")
const cors = require("cors")

const userRouters = require("./routes/user.routes")
const followRoutes = require("./routes/follow.routes")
const publicationRouters = require("./routes/publication.routers")


//conexion base de datos
connection()

//servidor node
const app = express()
puerto = 8000

//configurar cors
app.use(cors())

//convertir los datos del body a objetos js
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Ruta de prueba

app.get("/ruta-prueba", (req, res) => {

    return res.status(200).json({
        "id": 1,
        "nombre": "Jhony",
        "web": "jhonymelaslabo.cak"

    })

})

//cargar configuracion de las rutas
app.use("/api" ,userRouters)
app.use("/api" ,followRoutes)
app.use("/api" ,publicationRouters)


//poner el servidor a escuchar

app.listen(puerto, ()=>{
    console.log("Servidor corriendo en el puerto ", puerto)
})