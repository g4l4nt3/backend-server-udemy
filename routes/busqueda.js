var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

app.get('/todo/:busqueda', (request, response, next) => {
    var busqueda = request.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(regex),
            buscarMedicos(regex),
            buscarUsuarios(regex)
        ])
        .then(respuestas => {
            return response.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });
});

function buscarHospitales(regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .exec((err, hospitales) => {
                if (err)
                    reject({ menssage: 'Error al cargar hospitales' });
                else
                    resolve(hospitales)
            });
    });
}

function buscarMedicos(regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .exec((err, medicos) => {
                if (err)
                    reject({ menssage: 'Error al cargar medicos' });
                else
                    resolve(medicos)
            });
    });
}

function buscarUsuarios(regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({})
            .or([{ nombre: regex }, { email: regex }]) //busqueda por dos campos
            .exec((err, usuarios) => {
                if (err)
                    reject({ menssage: 'Error al cargar usuarios' });
                else
                    resolve(usuarios)
            });
    });
}

module.exports = app;