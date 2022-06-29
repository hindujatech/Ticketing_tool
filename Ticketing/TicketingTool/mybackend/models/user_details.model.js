var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var UserDetailSchema = new Schema({
    username: { type: String, required: true, unique: true },
    location: { type: String },
    mobile_number: { type: String },
    profile_picture_url: { type: String, required: true },
    created_on: { type: Date, required: true, default: Date.now },
    deleted: { type: Boolean, required: true, default: false }
}, {
        versionKey: false
    })

const UserDetail = mongoose.model('user_details', UserDetailSchema)

module.exports = UserDetail;