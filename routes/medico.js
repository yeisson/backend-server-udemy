var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

// var SEED = require('../config/config').SEED;

var app = express();

var Medico = require('../models/medico');

// ============================================
// Obtener todos los Medicos
// ============================================
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email') //para traer la info de usuario
        .populate('hospital') //para traer la info de usuario
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });
            });
});


// ============================================
// Obetenr un Médico
// ============================================

app.get('/:id', (req, res) => {

    var id = req.params.id;

    Medico.findById(id)
        .populate('usuario', 'nombre email img ')
        .populate('hospital')
        .exec((err, medico) => {

            if (err) { //Si no ejecuto la consulta es problema del server
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al crear Medico',
                    errors: err
                });
            }

            if (!medico) { //Si no encontro medico
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El medico con el id ' + id + ' no existe',
                    errors: { message: 'No existe un medico con ese ID' }
                });
            }

            res.status(200).json({
                ok: true,
                medico: medico
            });


        });

});

// ============================================
// Actualizar Medico
// ============================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) { //Si no ejecuto la consulta es problema del server
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear Medico',
                errors: err
            });
        }

        if (!medico) { //Si no encontro medico
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {

            if (err) { //Si no actualizo el medico
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });

});

// ============================================
// Crear un nuevo medico
// ============================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });

    });

});


// ============================================
// Eliminar Usuario por el id
// ============================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe medico con ese id',
                errors: { message: 'No existe medico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
        });

    });

});

module.exports = app;