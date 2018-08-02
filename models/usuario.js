var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//creo el modelo con algunas restricciones de negocio
var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El email es requerido'] },
    password: { type: String, required: [true, 'La contraseña es requerida'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE' }
});

// hago publico el modelo
module.exports = mongoose.model('Usuario', usuarioSchema);