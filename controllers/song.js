'use strict'

var fs = require('fs');
var path = require('path');
var mongoosePaginate = require('mongoose-pagination');
var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res) {
    var songId = req.params.id;
    Song.findById(songId).populate({ path: 'album' }).exec((err, song) => {
        if (err) {
            res.status(500).send({ message: 'error en la peticion' });
        } else {
            if (!song) {
                res.status(404).send({ message: 'no existe el album' });
            } else {
                res.status(200).send({ song });
            }
        }
    });

    //res.status(200).send({ message: 'metodo getSong del controlador song.js' });
}

function getSongs(req, res) {
    var albumId = req.params.album;
    if (!albumId) {
        //sacar todos los songs de la bd
        var find = Song.find({}).sort('number');
    } else {
        //sacar los songs de un album elegido
        var find = Song.find({ album: albumId }).sort('number')
    }
    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec(function(err, songs) {
        if (err) {
            res.status(500).send({ message: 'error en la peticion' });
        } else {
            if (!songs) {
                res.status(404).send({ message: 'no existe hay cancion' });
            } else {
                res.status(200).send({ songs });
            }
        }
    });
}


function saveSong(req, res) {
    var song = new Song();
    var params = req.body;

    song.number = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = 'null';
    song.album = params.album;


    song.save((err, songStored) => {
        if (err) {
            res.status(500).send({ message: 'error al guardar la cancion' });
        } else {
            if (!songStored) {
                res.status(404).send({ message: 'la cancion no ha sido guardado' });
            } else {
                res.status(200).send({ song: songStored });
            }
        }
    });

}

function updateSong(req, res) {
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdate) => {
        if (err) {
            res.status(500).send({ message: 'error en el servidor al actualizar cancion' });
        } else {
            if (!songUpdate) {
                res.status(404).send({ message: 'la cancion no ha sido actualizado' });
            } else {
                res.status(200).send({ song: songUpdate });
            }
        }
    });
}

function deleteSong(req, res) {
    var songId = req.params.id;

    Song.findByIdAndRemove(songId, (err, songRemoved) => {
        if (err) {
            res.status(500).send({ message: 'error al eliminar cancion' });
        } else {
            if (!songRemoved) {
                res.status(404).send({ message: 'la cancion no ha sido eliminado' });
            } else {
                res.status(200).send({ song: songRemoved });
            }
        }
    });
}

function uploadSongFile(req, res) {
    var songId = req.params.id;
    var file_name = 'no subido...';

    if (req.files) {
        var file_path = req.files.file.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];

        if (file_ext == 'mp3' || file_ext == 'ogg') {
            Song.findByIdAndUpdate(songId, { file: file_name }, (err, songUpdated) => {
                if (!songUpdated) {
                    res.status(404).send({ message: 'cancion no ha podido actualizar' + songUpdated });
                } else {
                    res.status(200).send({ song: songUpdated });
                }
            })
        } else {
            res.status(200).send({ message: 'extension de archivo no valida' });
        }

        console.log(ext_split);
    } else {
        res.status(200).send({ message: 'no has subido ningun archivo' });
    }

}

function getSongFile(req, res) {
    var songFile = req.params.songFile;
    var path_file = './uploads/songs/' + songFile;

    fs.exists(path_file, function(exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(200).send({ message: 'no existe la imagen' });
        }
    });
}

module.exports = {
    getSong,
    getSongs,
    saveSong,
    updateSong,
    deleteSong,
    uploadSongFile,
    getSongFile
}