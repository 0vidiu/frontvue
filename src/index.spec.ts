import { expect } from 'chai';
import 'mocha';
import Greeter from './index';

describe('Greeter', () => {
    it('correctly creates greeter instance', () => {
        const greeter = Greeter('Hola');
        expect(greeter.hello('John')).to.equal('Hola, John!');
    });

    it('throws if instantiated without parameter', () => {
        expect(() => Greeter()).to.throw(Error);
    });
});
