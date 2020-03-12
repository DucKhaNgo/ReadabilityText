var daleChallFormula = require('dale-chall-formula');
var automatedReadability = require('automated-readability');
var colemanLiau = require('coleman-liau');
var flesch = require('flesch');
var fleschKincaid = require('flesch-kincaid');
var gunningFog = require('gunning-fog');
var smogFormula = require('smog-formula');
var spacheFormula = require('spache-formula');
module.exports= {
    checkByUrl: (data, text) => {
        console.log('checkbyUrl Controller: ', data, text);
        return 'check by url';
    },
    checkByDirect: (data) => {
        console.log('data check by direct--- ', data);
        return 'check by direct';
    },
    checkByFile: (fileData) => {
        console.log('file data-------', fileData);
        return 'check by FIle';
    }
}
