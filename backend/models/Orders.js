const mongoose = require('mongoose')

const { Schema } = mongoose;

const OrderSchema = new Schema({
email: {
    type: String,
},
order_data: {
    type: Array,
    required: true,
    default: []
},

});

module.exports = mongoose.models.legacy_order || mongoose.model('legacy_order', OrderSchema)
