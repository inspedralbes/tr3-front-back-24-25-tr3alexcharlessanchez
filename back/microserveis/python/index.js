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

const port = portLocal;
const url = urlLocal;
const portSequelize = portSequelizeLocal;
const portMongo = portMongoLocal;

app.use('/grafics', express.static(path.join(__dirname, 'grafics')));


app.get('/', (req, res) => {
    const jugadorsJSON = JSON.stringify(jugadors);
    spawn('python', ['./microserveis/python/scripts/winrate.py', jugadorsJSON], { stdio: 'inherit' });
    res.send("Hola")
}
);

async function getPartides() {
    const partides = await axios.get(`http://${url}:${portSequelize}/partides`);
    return partides.data;
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