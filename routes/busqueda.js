var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//==================================================
// Busqueda general
//==================================================
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
            .populate('usuario', 'nombre email')
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
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
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
        Usuario.find({}, 'nombre email')
            .or([{ nombre: regex }, { email: regex }]) //busqueda por dos campos
            .exec((err, usuarios) => {
                if (err)
                    reject({ menssage: 'Error al cargar usuarios' });
                else
                    resolve(usuarios)
            });
    });
}

//==================================================
// Busqueda por coleccion
//==================================================
app.get('/coleccion/:tabla/:busqueda', (request, response) => {
    var busqueda = request.params.busqueda;
    var tabla = request.params.tabla;
    var regex = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'hospital':
            promesa = buscarHospitales(regex);
            break;

        case 'medico':
            promesa = buscarMedicos(regex);
            break;

        case 'usuario':
            promesa = buscarUsuarios(regex);
            break;

        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'La coleccion solo puede ser usuario, hospital o medico'
            });
    }

    promesa.then(data => {
        return response.status(200).json({
            ok: true,
            [tabla]: data //Indica que la propiedad es la variable!
        });
    });
});

module.exports = app;