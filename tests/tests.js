var expect = require('chai').expect;
var moment = require('moment');

var InterpreterStream = require('../lib/InterpreterStream');

describe('interpreter', function() {
    var stream;

    beforeEach(function() {
        stream = new InterpreterStream({
            mandantId: 1
        });
    });

    it('should output an position instance', function(done) {
        var collection = [];

        stream.on('finish', function() {
            var entry = collection[0];
            expect(entry.id()).to.be.null;
            expect(entry.mandant()).to.equal(1);
            expect(entry.date().format('YYYY-MM-DD')).to.equal('2014-05-02');
            expect(entry.purpose()).to.equal('foo1');
            expect(entry.classification()).to.be.null;
            expect(entry.partner()).to.equal('partner1');
            expect(entry.partnerAccountNumber()).to.equal('123456');
            expect(entry.partnerBank()).to.equal('987654');
            expect(entry.amount()).to.equal(20.20);

            done();
        });

        stream.on('data', function(data) {
            collection.push(data);
        });

        stream.write({
            "Auftragskonto": 123123,
            "Buchungstag": "28.04",
            "Valutadatum": "02.05.14",
            "Buchungstext": "FOLGELASTSCHRIFT",
            "Verwendungszweck": "foo1",
            "Beguenstigter/Zahlungspflichtiger": "partner1",
            "Kontonummer": "123456",
            "BLZ": "987654",
            "Betrag": "20,20",
            "Waehrung": "EUR",
            "Info": "Umsatz vorgemerkt"
        });
        stream.end();
    });

    it('should emit an error', function(done) {
        stream.on('finish', function() {
            expect(true).to.be.false;
        });

        stream.on('data', function() {
            expect(true).to.be.false;
        });

        stream.on('error', function(error) {
            expect(error.message).to.equal('undefined value not allowed');
            done();
        });

        stream.write({
            Betrag: '1',
            Valutadatum: '10.10.2014'
        });
        stream.end();
    });
});