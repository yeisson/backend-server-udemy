var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ============================================
// Verificar token
// ============================================

exports.verificaToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });

}


// ============================================
// Verificar Admin o mismo Usuario
// ============================================

exports.verificaADMINI_ROLE_o_MismoUsuario = function(req, res, next) {

    var usuario = req.usuario;
    var id = req.params.id;

    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {

        next();
        return;

    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'Token incorrecto - No admin, ni mismo usuario',
            errors: { message: 'No es administrador, no puede hacer eso' }
        });
    }

}