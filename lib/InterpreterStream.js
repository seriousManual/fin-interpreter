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
    options.objectMode = true;

    this._mandantId = parameterHelper.isSet(options.mandantId);

    Transform.call(this, options);
}

util.inherits(InterpreterStream, Transform);

InterpreterStream.prototype._transform = function (chunk, enc, cb) {
    var amount = +chunk[constants.amount].replace(AMOUNT_PATTERN, '.');
    var matches = chunk[constants.date].match(DATE_PATTERN);

    var data = {
        mandant: this._mandantId,
        date: moment({y: 2000 + +matches[3], M: +matches[2] - 1, d: +matches[1]}),
        purpose: chunk[constants.purpose],
        partner: chunk[constants.partner],
        partnerAccountNumber: chunk[constants.partnerAccountNumber],
        partnerBank: chunk[constants.partnerBank],
        amount: amount
    };

    this.push(new Position(data));
    cb();
};

module.exports = InterpreterStream;