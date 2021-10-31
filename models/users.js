const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String
    },
    // password: { type: String, required: true },
    name: { type: String },
    gender: { type: String },
    deliveryAddress: { type: Array},
    contactNo: { type: Number},
    // isAdmin: { type: Boolean, default: false },
    // profilePicture: { type: String, default: "" },
    // coupons: Array
});

module.exports = mongoose.model('User', userSchema);