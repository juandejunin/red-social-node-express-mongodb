const { Schema, model } = require("mongoose")

const UserSchema = Schema({
    name: {
        type: String,
        require: true
    },
    surname: String,
    bio: String,
    nick: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    role: {
        type: String,
        default:"role_user"
    },
    image: {
        type: String,
        default: "default.png"
    },
    create_at :{
        type: Date,
        default: Date.now
    }
})

module.exports = model("User", UserSchema)