var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var ticket_histroy = new Schema({
    ticket_code: { type: String, },
    admin_description: { type: String, required: false },
    status: { type: String},
 
    created_on: { type: Date, required: true, default: Date.now },
    deleted: { type: Boolean, required: true, default: false }
}, {
        versionKey: false
    })

const tickethistroy = mongoose.model('ticket_histroy', ticket_histroy)

module.exports = tickethistroy;