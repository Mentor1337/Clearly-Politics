// Polyfill for File class in Node.js < 20
if (typeof File === 'undefined') {
    const { Buffer } = require('node:buffer');
    globalThis.File = class File {
        constructor(bits, name, options = {}) {
            this.bits = bits;
            this.name = name;
            this.lastModified = options.lastModified || Date.now();
            this.type = options.type || '';
        }

        get size() {
            return Buffer.byteLength(this.bits.join(''));
        }

        text() {
            return Promise.resolve(this.bits.join(''));
        }

        arrayBuffer() {
            return Promise.resolve(Buffer.from(this.bits.join('')));
        }

        stream() {
            const { Readable } = require('node:stream');
            return Readable.from(this.bits);
        }

        slice(start, end, type) {
            const slicedBits = this.bits.slice(start, end);
            return new File(slicedBits, this.name, { type: type || this.type });
        }
    };
}
