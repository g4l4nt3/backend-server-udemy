var express = require('express');
var app = express();
var Medico = require('../models/medico');
var mdAutenticacion = require('../middlewares/autenticacion');

//==================================================
// Obtener todos los medicos
//==================================================
app.get('/', (request, response) => {

    Medico.find({}, (err, medicos) => {
        if (err)
            return response.status(500).json({
                ok: true,
                mensaje: "Error al obtener medicos",
                errors: err
            });

        return response.status(200).json({
            ok: true,
            medicos: medicos
        });
    });
});

//==================================================
// Crear medico
//==================================================
app.post('/', mdAutenticacion.verficaToken, (request, response) => {
    var body = request.body;

    var medico = new Medico();
    medico.nombre = body.nombre;
    medico.usuario = request.usuarioLogueado;
    medico.hospital = body.idHospital;

    medico.save((err, medicoGuardado) => {
        if (err)
            return response.status(400).json({
                ok: false,
                mensaje: "Error al guardar medico",
                errors: err
            });

        return response.status(200).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});


//==================================================
// Actualizar medico
//==================================================
app.put('/:id', mdAutenticacion.verficaToken, (request, response) => {
    var body = request.body;
    var id = request.params.id;

    Medico.findById(id, (err, medico) => {
        if (err)
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al obtener medico',
                errors: err
            });

        if (!medico)
            return response.status(500).json({
                ok: false,
                mensaje: 'No existe un medico con id ' + id,
                errors: { message: 'No existe un medico con id ' + id }
            });

        medico.nombre = body.nombre;
        medico.usuario = request.usuarioLogueado;
        medico.hospital = body.idHospital;

        medico.save((err, medicoGuardado) => {
            if (err)
                return response.status(400).json({
                    ok: false,
                    mensaje: "Error al actualizar medico",
                    errors: err
                });

            return response.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

//==================================================
// Eliminar medico
//==================================================
app.delete('/:id', mdAutenticacion.verficaToken, (request, response) => {
    var id = request.params.id;

    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err)
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al obtener medico',
                errors: err
            });

        if (!medicoEliminado)
            return response.status(500).json({
                ok: false,
                mensaje: 'No existe un medico con id ' + id,
                errors: { message: 'No existe un medico con id ' + id }
            });

        return response.status(200).json({
            ok: true,
            medico: medicoEliminado
        });
    });
});

module.exports = app;