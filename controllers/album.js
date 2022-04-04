'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
//const artist = require('../models/artist');


function getAlbum(req, res) {
    var albumId = req.params.id;

    Album.findById(albumId).populate({ path: 'artist' }).exec((err, album) => {
        if (err) {
            res.status(500).send({ message: 'error en la peticion' });
        } else {
            if (!album) {
                res.status(404).send({ message: 'no existe el artista' });
            } else {
                res.status(200).send({ album });
            }
        }
    });


    //res.status(200).send({ message: 'metodo getAlbum del controlador artist.js' });
}

function getAlbums(req, res) {
    var artistId = req.params.artist;
    if (!artistId) {
        //sacar todos los album de la bd
        var find = Album.find({}).sort('title');
    } else {
        //sacar los albums de un artista elegido
        var find = Album.find({ artist: artistId }).sort('year')
    }
    find.populate({ path: 'artist' }).exec((err, albums) => {
        if (err) {
            res.status(500).send({ message: 'error en la peticion' });
        } else {
            if (!albums) {
                res.status(404).send({ message: 'no existe el albums' });
            } else {
                res.status(200).send({ albums });
            }
        }
    })
}


function saveAlbum(req, res) {
    var album = new Album();
    var params = req.body;

    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.image = 'null';
    album.artist = params.artist;

    album.save((err, albumStored) => {
        if (err) {
            res.status(500).send({ message: 'error al guardar el album' });
        } else {
            if (!albumStored) {
                res.status(404).send({ message: 'el album no ha sido guardado' });
            } else {
                res.status(200).send({ album: albumStored });
            }
        }
    });
}

function updateAlbum(req, res) {
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdate) => {
        if (err) {
            res.status(500).send({ message: 'error en el servidor al guardar el album' });
        } else {
            if (!albumUpdate) {
                res.status(404).send({ message: 'el album no ha sido actualizado' });
            } else {
                res.status(200).send({ album: albumUpdate });
            }
        }
    });
}

function deleteAlbum(req, res) {
    var albumId = req.params.id;
    Album.findByIdAndRemove(albumId, (err, albumRemoved) => {
        if (err) {
            res.status(500).send({ message: 'error al eliminar el album' });
        } else {
            if (!albumRemoved) {
                res.status(404).send({ message: 'el album no ha sido eliminado' });
            } else {
                Song.find({ album: albumRemoved._id }).remove((err, songRemoved) => {
                    if (err) {
                        res.status(500).send({ message: 'error al eliminar cancion' });
                    } else {
                        if (!songRemoved) {
                            res.status(404).send({ message: 'la cancion no ha sido eliminado' });
                        } else {
                            res.status(200).send({ album: albumRemoved });
                        }
                    }
                });
            }
        }
    });
}

function uploadImage(req, res) {
    var albumId = req.params.id;
    var file_name = 'no subido...';

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif') {
            Album.findByIdAndUpdate(albumId, { image: file_name }, (err, albumUpdated) => {
                if (!albumUpdated) {
                    res.status(404).send({ message: 'album no ha podido actualizar' });
                } else {
                    res.status(200).send({ album: albumUpdated });
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
    var path_file = './uploads/albums/' + imageFile;

    fs.exists(path_file, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'no existe la imagen' });
        }
    });
}


module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum,
    uploadImage,
    getImageFile
}