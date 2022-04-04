'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
//const { create } = require('../models/user');
var User = require('../models/user');
var jwt = require('../services/jwt');

function pruebas(req, res) {
    res.status(200).send({
        message: 'probando una accion del controlador de ususarios del api rest con node y mongo'
    })
}

function saveUser(req, res) {
    var user = new User();
    var params = req.body;

    console.log(params);

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE-USER';
    user.image = 'null';

    if (params.password) {
        //enccriptar contraseña y guardar
        bcrypt.hash(params.password, null, null, function(err, hash) {

            user.password = hash;
            if (user.name != null && user.surname != null && user.email != null) {
                //guardar en bd el user
                user.save((err, userStored) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al guardar el user' });
                    } else {
                        if (!userStored) {
                            res.status(404).send({ message: 'no se ha registrado el user' });
                        } else {
                            res.status(200).send({ user: userStored });
                        }
                    }
                });
            } else {
                res.status(200).send({ message: 'introduce todos los campos' });
            }
        });
    } else {
        res.status(200).send({ message: 'introduce la contraseña' });
    }

}

function loginUser(req, res) {
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (err) {
            res.status(500).send({ message: 'error en la peticion' });
        } else {
            if (!user) {
                res.status(404).send({ message: 'usuario no existe' });
            } else {
                //comprobar la contraseña
                bcrypt.compare(password, user.password, function(err, check) {
                    if (check) {
                        //devolver los datos del usuario logueado
                        if (params.gethash) {
                            //devolver un token jwt
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        } else {
                            res.status(200).send({ user });
                        }
                    } else {
                        res.status(404).send({ message: 'usuario no ha podido loguearse' });
                    }
                })
            }
        }
    });
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;
    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'no tienes permiso de actualizar el usuario' });
    }

    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
        if (err) {
            res.status(500).send({ message: 'error al actualizar el usuario' });
        } else {
            if (!userUpdated) {
                res.status(404).send({ message: 'usuario no ha podido actualizar' });
            } else {
                res.status(200).send({ user: userUpdated });
            }
        }
    });
}

function uploadImage(req, res) {
    var userId = req.params.id;
    var file_name = 'no subido...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif') {
            User.findByIdAndUpdate(userId, { image: file_name }, (err, userUpdated) => {
                if (!userUpdated) {
                    res.status(404).send({ message: 'usuario no ha podido actualizar' });
                } else {
                    res.status(200).send({ image: file_name, user: userUpdated });
                }
            })
        } else {
            res.status(200).send({ message: 'extension de archivo no valida' });
        }

        console.log(ext_split);
    } else {
        res.status(200).send({ message: 'no has subido ninguna imagen' });
    }

}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = './uploads/users/' + imageFile;

    fs.exists(path_file, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'no existe la imagen' });
        }
    });
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage,
    getImageFile
};