var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');
var fs = require('fs');

// Default options
app.use(fileUpload());

//==================================================
// Subir archivo de imagen al servidor
//==================================================
app.put('/:tipo/:id', (request, response) => {
    var tipo = request.params.tipo;
    var id = request.params.id;

    // Tipos de coleccion
    var coleccionesValidas = ['hospitales', 'medicos', 'usuarios'];
    if (coleccionesValidas.indexOf(tipo) < 0)
        return response.status(400).json({
            ok: false,
            mensaje: "Coleccion no valida",
            errors: { message: "Las colecciones válidas son " + coleccionesValidas.join(',  ') }
        });

    if (!request.files)
        return response.status(400).json({
            ok: false,
            mensaje: "No hay archivos seleccionados"
        });

    // Obtener nombre del archivo
    var archivo = request.files.imagen;
    var nombreCortado = archivo.name.split('.'); //NEGRADA!
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Solo estas extensiones aceptamos
    var extensionesPermitidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesPermitidas.indexOf(extensionArchivo) < 0)
        return response.status(400).json({
            ok: false,
            mensaje: "Extension de archivo no valida",
            errors: { message: "Las extensiones válidas son " + extensionesPermitidas.join(',  ') }
        });

    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds() }.${extensionArchivo}`;

    // Mover el archivo del temporal a un path especifico.
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    archivo.mv(path, (err) => {
        if (err)
            return response.status(500).json({
                ok: false,
                mensaje: "Error al subir archivo",
                errors: err
            });

        subirPorTipo(tipo, id, nombreArchivo, response);
    });
});

function guardarArchivo(tipo, id, nombreArchivo, response, data, err) {
    if (err)
        return response.status(400).json({
            ok: false,
            mensaje: 'El id ' + id + ' no existe',
            errors: { message: 'No existe ID' }
        });

    var pathViejo = `./uploads/${ tipo }/${ data.img }`; //genero el path donde estan las img por ID
    if (fs.existsSync(pathViejo)) { //si existe el archivo
        fs.unlink(pathViejo); // lo elimina
    }

    data.img = nombreArchivo;
    data.save((err, itemGuardado) => {
        if (err)
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al guardar archivo',
                errors: err
            });

        return response.status(200).json({
            ok: true,
            mensaje: "Archivo subido con exito",
            data: data
        });
    });

}

function subirPorTipo(tipo, id, nombreArchivo, response) {
    if (tipo == 'usuarios') {
        Usuario.findById(id, (err, data) => {
            guardarArchivo(tipo, id, nombreArchivo, response, data, err)
        });
    }

    if (tipo == 'medicos') {
        Medico.findById(id, (err, data) => {
            guardarArchivo(tipo, id, nombreArchivo, response, data, err)
        });
    }

    if (tipo == 'hospitales') {
        Hospital.findById(id, (err, data) => {
            guardarArchivo(tipo, id, nombreArchivo, response, data, err)
        });
    }
}

module.exports = app;