const mongoose = require('mongoose');

const accountSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true, uppercase: true, unique: true, dropDups: true },
    password: { type: String, required: true },
    apiToken: { type: String, required: true }
});

module.exports = mongoose.model('Account', accountSchema);