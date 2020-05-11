const mongoose = require('mongoose');

const courseSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    code: { type: String, required: true, uppercase: true, unique: true, dropDups: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    scu: { type: Number, required: true },
});

module.exports = mongoose.model('Course', courseSchema);