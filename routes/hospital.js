var express = require('express');
var app = express();
var mdAutenticacion = require('../middlewares/autenticacion');
var Hospital = require('../models/hospital');

//==================================================
// Obtener todos los hospitales
//==================================================
app.get('/', (request, response, next) => {

    var desde = request.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec((err, hospitales) => {

            if (err)
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error al obtener hospitales',
                    errors: err
                });

            Hospital.count({}, (err, contador) => {
                return response.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    totalHospitales: contador
                });
            });
        });
});

//==================================================
// Crear un hospital  
//==================================================
app.post('/', mdAutenticacion.verficaToken, (request, response) => {
    var body = request.body;

    var hospital = new Hospital();
    hospital.nombre = body.nombre;
    hospital.usuario = request.usuarioLogueado;

    hospital.save((err, hospitalGuardado) => {

        if (err)
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al guardar hospitales',
                errors: err
            });

        return response.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });
});

//==================================================
// Actualizar hospital  
//==================================================
app.put('/:id', mdAutenticacion.verficaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (err, hospital) => {

        if (err)
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al obtener hospital',
                errors: err
            });

        if (!hospital)
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con id ' + id,
                errors: { message: 'No existe un hospital con id ' + id }
            });

        hospital.nombre = body.nombre;
        hospital.usuario = request.usuarioLogueado;

        hospital.save((err, hospitalGuardado) => {

            if (err)
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });

            return response.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});


//==================================================
// Borrar hospital  
//==================================================
app.delete('/:id', (request, response) => {
    var id = request.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err)
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al obtener hospital',
                errors: err
            });

        if (!hospitalBorrado)
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con id ' + id,
                errors: { message: 'No existe un hospital con id ' + id }
            });

        return response.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});


module.exports = app;