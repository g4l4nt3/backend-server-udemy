var config = require('../config/config');
var jwt = require('jsonwebtoken');

//==================================================
// Verificar Token Middleware
//==================================================
exports.verficaToken = function(request, response, next) {
    var seed = config.SEED;
    var token = request.query.token;

    jwt.verify(token, seed, (err, decoded) => {
        if (err) {
            return response.status(401).json({
                ok: false,
                mensaje: 'No autorizado',
                errors: err
            });
        }

        request.usuarioLogueado = decoded.usuario;
        next();
    });
}