var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var ConfiguartionValueSchema = new Schema({
    key: { type: String, required: true },
    value: { type: [Schema.Types.Mixed], required: true },
    deleted: { type: Boolean, required: true, default: false }
}, { strict: false })

const ConfiguartionValue = mongoose.model('configuration_values', ConfiguartionValueSchema)

module.exports = ConfiguartionValue;