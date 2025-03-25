const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

const portLocal = process.env.PORT_NODE_MONGO_LOCAL;
const portProd = process.env.PORT_NODE_MONGO_PRODUCCIO;
const user = process.env.MONGO_USER;
const passsowrd = process.env.MONGO_PASSWORD;
const cluster = process.env.MONGO_CLUSTER;

const port = portLocal;

const numeroBombesPartidaSchema = new mongoose.Schema({
    idPartida: { type: Number, required: true },
    numeroBombes: { type: Number, required: true }
});

const distanciaPartidaSchema = new mongoose.Schema({
    idPartida: { type: Number, required: true },
    distancia: { type: Number, required: true }
});

const powerupsJugadorPartidaSchema = new mongoose.Schema({
    idPartida: { type: Number, required: true },
    idJugador: { type: Number, required: true },
    powerups: { type: Number, required: true }
});

const numeroBombesPartida = mongoose.model('numeroBombesPartida', numeroBombesPartidaSchema);

const distanciaPartida = mongoose.model('distanciaPartida', distanciaPartidaSchema);

const powerupsJugadorPartida = mongoose.model('powerupsJugadorPartida', powerupsJugadorPartidaSchema);



app.get('/numeroBombesPartida', async (req, res) => {
    try {
        const numeroBombesPartidaActualizats = await numeroBombesPartida.find().lean();
        res.json(numeroBombesPartidaActualizats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
});


app.post('/numeroBombesPartida', (req, res) => {
    const {idPartida, numeroBombes} = req.body;
    try {
        const newNumeroBombesPartida = new numeroBombesPartida({idPartida, numeroBombes});
        newNumeroBombesPartida.save().then(() => {
            res.send('Numero de bombes per partida guardat correctament');
        }
        ).catch(err => {
            console.error(err);
            res.status(500).send('Error al guardar el numero de bombes per partida');
        }
        );
    } catch (err) {
        console.error(err);
    }
}
);

app.get('/distanciaPartida', async (req, res) => {
    try {
        const distanciaPartidaActualitzats = await distanciaPartida.find().lean();
        res.json(distanciaPartidaActualitzats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
}
);

app.post('/distanciaPartida', (req, res) => {
    const {idPartida, distancia} = req.body;
    try {
        const newDistanciaPartida = new distanciaPartida({idPartida, distancia});
        newDistanciaPartida.save().then(() => {
            res.send('Distancia per partida guardada correctament');
        }
        ).catch(err => {
            console.error(err);
            res.status(500).send('Error al guardar la distancia per partida');
        }
        );
    } catch (err) {
        console.error(err);
    }
}
);

app.get('/powerupsJugadorPartida', async (req, res) => {
    try {
        const powerupsJugadorPartidaActualitzats = await powerupsJugadorPartida.find().lean();
        res.json(powerupsJugadorPartidaActualitzats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
}
);

app.post('/powerupsJugadorPartida', (req, res) => {
    const {idPartida, idJugador, powerups} = req.body;
    try {
        const newPowerupsJugadorPartida = new powerupsJugadorPartida({idPartida, idJugador, powerups});
        newPowerupsJugadorPartida.save().then(() => {
            res.send('Powerups per jugador per partida guardats correctament');
        }
        ).catch(err => {
            console.error(err);
            res.status(500).send('Error al guardar els powerups per jugador per partida');
        }
        );
    } catch (err) {
        console.error(err);
    }
}
);


process.on('message', (message) => {
    if (message.action === 'start') {

        app.listen(port, () => {
            console.log(`Servei de MongoDB corrent a ${port}`);
        }).on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`El port ${port} ja està en ús, però el servidor està funcionant.`);
            } else {
                console.error(err);
            }
        });
        mongoose.connect(`mongodb+srv://${user}:${passsowrd}@${cluster}.hrrx5.mongodb.net/?retryWrites=true&w=majority&appName=TR2G6`).then(() => console.log("Connectat a MongoDB"))
            .catch(err => console.error('Error en connectar a MongoDB Atlas:', err))
    }
    if (message.action === 'stop') {
        process.send('exit')
        process.exit();
    }
});