var express = require('express');
var app = express();
var Usuario = require('../models/usuario');


// Obtener todos los usuarios
app.get('/', (request, response, next) => {

    Usuario.find({}, 'nombre email img role').exec(
        (err, usuarios) => {

            if (err) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener usuarios',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});

// Crear un nuevo usuario
app.post('/', (request, response) => {
    var body = request.body;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: body.password,
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al guardar usuario',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        });
    });

});


module.exports = app;