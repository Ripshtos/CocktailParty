const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    fname: {
        type: String,
        require: true
    },
    lname: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
    ,
    city:
    {
        type: String,
        require: true
    },
    address: {
        type: String,
        require: true
    },

    birthday: {
        type: Date,
        require: true
    },

    postal:
    {
        type:Number,
        require: true
    },
    email:
    {
        type:String,
        require:true
    },

    phone:
    {
        type:Number,
        require: true
    },

    admin:
    {
        type:Boolean,
        require: true
    },

})


const User = mongoose.model('users', userSchema);
module.exports = User;
