var stream = require('stream');
var util = require('util');
var Transform = require('stream').Transform;

var moment = require('moment');
var common = require('fin-common');
var Position = common.Models.Position;
var parameterHelper = common.util.parameterHelper;

var constants = require('./constants');

var DATE_PATTERN = /(\d{2})\.(\d{2}).(\d{2})/;
var AMOUNT_PATTERN = /,/;

function InterpreterStream(options) {
    options = options || {};

    this._mandantId = parameterHelper.isSet(options.mandantId);

    Transform.call(this, {objectMode: true});
}

util.inherits(InterpreterStream, Transform);

InterpreterStream.prototype._transform = function (chunk, enc, cb) {
    try {
        this.push(this._convertData(chunk));
        cb();
    } catch (error) {
        this.emit('error', error);
    }
};

InterpreterStream.prototype._convertData = function (data) {
    var amount = +data[constants.amount].replace(AMOUNT_PATTERN, '.');
    var matches = data[constants.date].match(DATE_PATTERN);

    var positionData = {
        mandant: this._mandantId,
        date: moment({y: 2000 + +matches[3], M: +matches[2] - 1, d: +matches[1]}),
        purpose: data[constants.purpose],
        partner: data[constants.partner],
        partnerAccountNumber: data[constants.partnerAccountNumber],
        partnerBank: data[constants.partnerBank],
        amount: amount
    };

    return new Position(positionData);
};

module.exports = InterpreterStream;