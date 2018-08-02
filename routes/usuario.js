var express = require('express');
var app = express();
var Usuario = require('../models/usuario');
var bcrypt = require('bcryptjs');
// var config = require('../config/config');
// var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');

//==================================================
// Obtener todos los usuarios
//==================================================
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

//==================================================
// Verificar Token Middleware / se hizo una version optimizada en el archivo middlewares/autenticacion
//==================================================
// app.use('/', (request, response, next) => {
//     var seed = config.SEED;
//     var token = request.query.token;

//     jwt.verify(token, seed, (err, decode) => {
//         if (err) {
//             return response.status(401).json({
//                 ok: false,
//                 mensaje: 'No autorizado',
//                 errors: err
//             });
//         }

//         next();
//     });
// });

//==================================================
// Actualizar usuario
//==================================================
app.put('/:id', mdAutenticacion.verficaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Usuario.findById(id, 'nombre email img role').exec((err, usuario) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        if (body.role) usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            response.status(200).json({
                ok: true,
                usuario: usuarioGuardado,
                usuarioToken: request.usuarioLogueado
            });
        });
    });
});

//==================================================
// Crear un nuevo usuario
//==================================================
app.post('/', mdAutenticacion.verficaToken, (request, response) => {
    var body = request.body;

    let encriptarPass = (password) =>
        (password) ? bcrypt.hashSync(password, 10) : null;

    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: encriptarPass(body.password),
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
            usuario: usuarioGuardado,
            usuarioToken: request.usuarioLogueado
        });
    });

});
//==================================================
// Borrar usuario
//==================================================
app.delete('/:id', mdAutenticacion.verficaToken, (request, response) => {
    var id = request.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioBorrado,
            usuarioToken: request.usuarioLogueado
        });

    });


});

module.exports = app;