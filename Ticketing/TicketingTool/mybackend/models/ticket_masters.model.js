var mongoose = require('mongoose')
var CounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_number: { type: Number, default: 0 }
});
var counter = mongoose.model('counters', CounterSchema);
var TicketMasterSchema = new mongoose.Schema({
    ticket_code: { type: String, unique: true },
    department: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    attachment: { type: String, required: false },
    created_by: { type: String, required: true },
    modified_by: { type: String, required: false },
    sub_function: { type: String, required: false },
    ticket_category: { type: String, required: false },
    priority: { type: String, required: false },
    addressed_on: { type: Date, required: false },
    tentative_closed_on: { type: Date, required: false },
    closed_reason: { type: String, required: false },
    admin_description: { type: String, required: false },
    approved_by: { type: String, required: false },
    approved_on: { type: Date, required: false },
    assigned_to: { type: String, required: false },
    assigned_on: { type: Date, required: false },
    status: { type: String, required: true, enum: ['Open', , 'Waiting', 'Processing', 'Closed'], default: 'Open' },
    created_on: { type: Date, required: true, default: Date.now },
    deleted: { type: Boolean, required: true, default: false },
    modified_on: { type: Date, required: true, default: Date.now },
    onBehalfOf:{type: String, required: false}
},
    {
        versionKey: false
    })

TicketMasterSchema.pre('save', function (done) {
    var document = this;
    if (document.isNew) { //new Record => create
        counter.findByIdAndUpdate({ _id: 'ticket_code' }, { $inc: { sequence_number: 1 } }, function (error, counter) {
            if (error)
                return done(error);
            var count_string = "" + counter.sequence_number;
            var pad = "00000"
            var ticket_code = "ST" + pad.substring(0, pad.length - count_string.length) + count_string
            document.ticket_code = ticket_code;
            done();
        });

    } else {
        done()
    }
});

const TicketMaster = mongoose.model('ticket_masters', TicketMasterSchema)

module.exports = TicketMaster;