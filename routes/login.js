var express = require('express');
var bcrypt = require('bcryptjs');
var app = express();
var Usuario = require('../models/usuario');
var config = require('../config/config');
var jwt = require('jsonwebtoken');

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//==================================================
// Autenticacion Google
//==================================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async, (request, response) => {
    var token = request.body.token;
    var googleUser = await verify(token)
        .catch(err => {
            return response.status(403).json({
                ok: false,
                mensaje: 'Token no válido',
                errors: err
            });
        });

    response.status(200).json({
        ok: true,
        googleUser: googleUser
    });
});



//==================================================
// Autenticacion normal
//==================================================
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
        var seed = config.SEED;
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