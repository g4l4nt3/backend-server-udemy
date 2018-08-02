var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario');
var jwt = require('jsonwebtoken');

app.post('/', (request, response) => {
    var body = request.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas',
                errors: { message: 'Credenciales incorrectas' }
            });
        }

        // Crear un token !!
        usuarioDB.password = 'fake';
        var payload = { usuario: usuarioDB };
        var seed = "seed-propio"
        var token = jwt.sign(payload, seed, { expiresIn: 14400 }); //token expira en 14400 segundos = 4 horas

        response.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });

    });

});


module.exports = app;