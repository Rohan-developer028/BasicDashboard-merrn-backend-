const  Mongoose  = require("mongoose")

const userSchema = Mongoose.Schema({
    name:String,
    email:String,
    password:String
})
usersmodel=Mongoose.model('users',userSchema) ;
module.exports = usersmodel ;