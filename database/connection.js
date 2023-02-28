
const mongoose = require ('mongoose')
mongoose.set('strictQuery', true);
require('dotenv').config()

const BBDD_URI = process.env.BBDD_URI

const connection = async() =>{
    
    try {
        mongoose.connect(BBDD_URI)
        console.log("conectados a la base de datos")
    } catch (error) {
        console.log(error)
        throw new Error("no se pudo conectar a la base de datos")
        
    }
}

module.exports =  connection
