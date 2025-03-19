const express = require('express');
const cors = require('cors');
const fs = require('fs');
const http = require('http')
const { fork } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });
const contrassenya = process.env.CONTRASSENYA_MICROSERVEIS;
const { Server } = require('socket.io');
const portLocal = process.env.PORT_NODE_MAIN_LOCAL;
const portProd = process.env.PORT_NODE_MAIN_PODUCCIO;
const { spawn } = require('child_process');

const app = express();
app.use(cors());

var processos = [];


/* <--------------- Processos llistats --------------> */

const rutaMicroserveis = './microserveis';
const directoris = obtenirNomsDirectoris(rutaMicroserveis);

function obtenirNomsDirectoris(rutaMicroserveis) {
    try {
        const continguts = fs.readdirSync(rutaMicroserveis, { withFileTypes: true });
        const directoris = continguts
            .filter(item => item.isDirectory())
            .map(item => item.name);
        return directoris;
    } catch (error) {
        console.error(`Error llegint la ruta: ${rutaMicroserveis}`, error);
        return [];
    }
}


function crearServei(nomServei) {
    processos[nomServei].referencia = fork(`${process.cwd()}/microserveis/${nomServei}/index.js`);
    processos[nomServei].actiu = true;
    processos[nomServei].referencia.on('exit', (code) => {
        console.log(`Procés de ${nomServei} tancat amb codi: ${code}`);
        processos[nomServei].referencia = null;
        processos[nomServei].actiu = false;
    });
}


/* <--------------- Servidor -------------------------> */

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
    }
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('parar', (contrassenyaUser, nomServei) => {
        if (contrassenyaUser === contrassenya) {
            if (processos[nomServei] && processos[nomServei].actiu) {
                processos[nomServei].actiu = false;
                processos[nomServei].referencia.send({ action: 'stop' });
                if (processos["mongoDB"] && processos["mongoDB"].actiu) {
                    processos["mongoDB"].referencia.send({ action: 'apagarLog', servei: nomServei });
                } else {
                    socket.emit("resposta", `El servei de mongoDB no està actiu o ha fallat!`);
                }
                socket.emit("resposta", `${nomServei} aturat`);
            } else if (processos[nomServei]) {
                socket.emit("resposta", `${nomServei} ja està aturat`);
            } else {
                socket.emit("resposta", "Servei no trobat");
            }
        } else {
            socket.emit("resposta", "No estàs autenticat");
            console.log("Intent Fraudulent!");
        }
    });

    socket.on('encendre', (contrassenyaUser, nomServei) => {
        if (contrassenyaUser === contrassenya) {
            if (processos[nomServei] && !processos[nomServei].actiu) {
                if (!processos[nomServei].referencia) crearServei(nomServei);
                processos[nomServei].actiu = true;
                processos[nomServei].referencia.send({ action: 'start' });
                if (processos["mongoDB"] && processos["mongoDB"].actiu) {
                    processos["mongoDB"].referencia.send({ action: 'encendreLog', servei: nomServei });
                } else {
                    socket.emit("resposta", `El servei de mongoDB no està actiu o ha fallat!`);
                }
                socket.emit("resposta", `${nomServei} actiu`);
            } else if (processos[nomServei]) {
                socket.emit("resposta", `${nomServei} ja està actiu`);
            } else {
                socket.emit("resposta", "Servei no trobat");
            }
        } else {
            socket.emit("resposta", "No estàs autenticat");
            console.log("Intent Fraudulent!");
        }
    });

    socket.on('getLog', (contrassenyaUser, nomServei) => {
        if (contrassenyaUser === contrassenya) {
            if (processos["mongoDB"] && processos["mongoDB"].actiu) {
                processos["mongoDB"].referencia.send({ action: 'getLog', servei: nomServei });

                processos["mongoDB"].referencia.on('message', (data) => {
                    if (data.logs) {
                        socket.emit("logs", data.logs);
                    } else {
                        socket.emit("logs", "Encara no hi han logs.");
                    }
                });
            }

            else {
                socket.emit("resposta", `El servei de mongoDB no està actiu o ha fallat!`);
            }
        } else {
            socket.emit("resposta", "No estàs autenticat");
            console.log("Intent Fraudulent!");
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get("/processos", (req, res) => {
    const contrassenyaUser = req.query.contrassenya;
    if (contrassenyaUser === contrassenya) {
        const processosArray = Object.keys(processos).map(nom => {
            return { nom: nom, actiu: processos[nom].actiu };
        });
        res.json(processosArray);
    } else {
        res.status(401).send("No estàs autenticat");
        console.log("Intent Fraudulent!");
    }
});


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

server.listen(portLocal, () => {
    console.log(`Main corrent al port ${portLocal}`);
    directoris.forEach(servei => {
        if (!processos[servei]) {
            processos[servei] = { nom: servei, referencia: null, actiu: false };
        }
        crearServei(servei);
        processos[servei].referencia.send({ action: 'start' });
    });
});