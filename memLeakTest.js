const readline = require('readline');
const fs = require('fs');
const v8 = require('v8');

class CustomBuffer {
    constructor() {
        this._buffer = new Array(1024 * 1024);
    }

    writeString(str) {
        Object.assign(this._buffer, str);
    }
}

function logMemory() {
    const memory = process.memoryUsage();
    console.log(`Memory currently used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
}

function writeHeapSnapshot() {
    v8.writeHeapSnapshot(`${Date.now()}.heapsnapshot`);
}

async function startMemleakSimulator(rl) {
    console.log('Hey, this is an interface to simulate a memory leak via calling a bunch of times to a leaking operation.');
    console.log('\nWhenever you want out, just type "exit" or "0".');
    console.log('\nHow many iterations would you like the operation to run? Every iteration adds about 8MB to the memory leak.');

    for await (const userInput of rl) {
        if (userInput === 'exit') {
            console.log('\nBYE BYE !!!');
            process.exit(0);
        }
        if (isNaN(Number(userInput)) || Number(userInput) === 0) {
            console.log('\n\nLooks like you didn\'t type a valid number. Lets try again.');
        }

        if (Number(userInput) < 0) {
            console.log('\n\nLooks like you\'re acting smart. Lets try again.');
        }
        else {
            await runIterationsOfLeakingOperation(Number(userInput));
            logMemory();
        }

        console.log('\n\nHow many iterations would you like the operation to run? Type "exit" or "0" to exit.');
    }

}

async function runIterationsOfLeakingOperation(iterations) {
    for (let i = 0; i < iterations; i++) {
        customBufferGetter = getCustomBufferGetter();
        const customBuffer = customBufferGetter();

        await readFromFileIntoBuffer(customBuffer);
    }
}

function getCustomBufferGetter() {
    const buffer = new CustomBuffer();
    var globalGetBuffer = customBufferGetter;

    function getNewOrGlobalBufferGetter() {
        if (!globalGetBuffer) {
            return () => { return buffer };
        }
        else {
            return globalGetBuffer;
        }
    }

    function getNewBufferGetter() {
        return buffer;
    }

    return getNewBufferGetter;
}

async function readFromFileIntoBuffer(buffer) {
    const data = fs.readFileSync('fileToReadFrom.txt', { encoding:'utf8', flag:'r' });
    buffer.writeString(data);
}

let customBufferGetter;

const readLineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

startMemleakSimulator(readLineInterface);
