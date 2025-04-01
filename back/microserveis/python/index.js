const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
const { spawn } = require('child_process');
app.use(cors());
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const axios = require('axios');

const portLocal = process.env.PORT_NODE_PYTHON_LOCAL;
const portProd = process.env.PORT_NODE_PYTHON_PRODUCCIO;
const urlLocal = process.env.URL_LOCAL;
const urlProd = process.env.URL_PRODUCCIO;
const portSequelizeLocal = process.env.PORT_NODE_SEQUELIZE_LOCAL;
const portSequelizeProd = process.env.PORT_NODE_SEQUELIZE_PRODUCCIO;
const portMongoLocal = process.env.PORT_NODE_MONGO_LOCAL;
const portMongoProd = process.env.PORT_NODE_MONGO_PRODUCCIO;

const port = portProd;
const url = urlProd;
const portSequelize = portSequelizeProd;
const portMongo = portMongoProd;

console.log(`${url}:${portSequelize}/partides`);

app.use('/grafics', express.static(path.join(__dirname, 'grafics')));


app.get('/winrate', async (req, res) => {
    try {
        const partides = await getPartides();
        const partidesJSON = JSON.stringify(partides);
        const personatges = await getPersonatges();
        const personatgesJSON = JSON.stringify(personatges);

        spawn('python3', ['./microserveis/python/scripts/winrate.py', partidesJSON, personatgesJSON], { stdio: 'inherit' });

        res.send("Grafic generat correctament");
    } catch (error) {
        console.error("Error obtenint les partides:", error);
        res.status(500).send("Error obtenint les partides");
    }
});

app.get('/podium', async (req, res) => {
    try {
        const jugadors = await getJugadors();
        const jugadorsJSON = JSON.stringify(jugadors);

        spawn('python3', ['./microserveis/python/scripts/podium.py', jugadorsJSON], { stdio: 'inherit' });

        res.send("Grafic generat correctament");
    } catch (error) {
        console.error("Error obtenint els jugadors:", error);
        res.status(500).send("Error obtenint els jugadors");
    }
}
);

app.get('/mitjanes', async (req, res) => {
    try {
        const powerupsPartida = await getPowerupsPartida();
        const powerupsPartidaJSON = JSON.stringify(powerupsPartida);
        const distanciaPartida = await getDistanciaPartida();
        const distanciaPartidaJSON = JSON.stringify(distanciaPartida);
        const numeroBombesPartida = await getNumeroBombesPartida();
        const numeroBombesPartidaJSON = JSON.stringify(numeroBombesPartida);
        const partides = await getPartides();
        const partidesJSON = JSON.stringify(partides);

        spawn('python3', ['./microserveis/python/scripts/mitjanes.py', powerupsPartidaJSON, distanciaPartidaJSON, numeroBombesPartidaJSON, partidesJSON], { stdio: 'inherit' });

        res.send("Grafic generat correctament");
    } catch (error) {
        console.error("Error obtenint les dades de les partides:", error);
        res.status(500).send("Error obtenint les dades de les partides");
    }
});


async function getJugadors() {
    const jugadors = await axios.get(`${url}:${portSequelize}/jugadors`);
    return jugadors.data;
}

async function getPartides() {
    const partides = await axios.get(`${url}:${portSequelize}/partida`);
    return partides.data;
}

async function getPersonatges() {
    const personatges = await axios.get(`${url}:${portSequelize}/personatge`);
    return personatges.data;
}

async function getNumeroBombesPartida() {
    const numeroBombesPartida = await axios.get(`${url}:${portMongo}/numeroBombesPartida`);
    return numeroBombesPartida.data;
}

async function getDistanciaPartida() {
    const distanciaPartida = await axios.get(`${url}:${portMongo}/distanciaPartida`);
    return distanciaPartida.data;
}

async function getPowerupsPartida() {
    const powerupsPartida = await axios.get(`${url}:${portMongo}/powerupsPartida`);
    return powerupsPartida.data;
}


process.on('message', (message) => {
    if (message.action === 'start') {

        app.listen(port, () => {
            console.log(`Servei de Python corrent a ${port}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`El port ${port} ja està en ús, però el servidor està funcionant.`);
            } else {
                console.error(err);
            }
        });
    }
    if (message.action === 'stop') {
        process.send('exit')
        process.exit();
    }
});