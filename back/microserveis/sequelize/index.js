const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
const portLocal = process.env.PORT_NODE_SEQUELIZE_LOCAL;
const portProd = process.env.PORT_NODE_SEQUELIZE_PODUCCIO;

const port = portLocal;

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: process.env.MYSQL_HOST || 'mysql',
        dialect: 'mysql',
        logging: false,
    }
);
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './sprites';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}.png`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'image/png') {
            return cb(new Error('Només es permeten imatges PNG'));
        }
        cb(null, true);
    }
});

const defineJugador = require('./jugador');
const definePartida = require('./partida');
const definePersonatge = require('./personatge');

const Jugador = defineJugador(sequelize);
const Partida = definePartida(sequelize);
const Personatge = definePersonatge(sequelize);

Jugador.hasMany(Partida, { foreignKey: 'jugador1', as: 'partidesComJugador1' });
Jugador.hasMany(Partida, { foreignKey: 'jugador2', as: 'partidesComJugador2' });
Partida.belongsTo(Jugador, { foreignKey: 'jugador1', as: 'Jugador1' });
Partida.belongsTo(Jugador, { foreignKey: 'jugador2', as: 'Jugador2' });

module.exports = { sequelize, Jugador, Partida, Personatge };

app.get('/jugadors', (req, res) => {
    Jugador.findAll()
        .then((jugadors) => {
            res.status(200).json(jugadors);
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ error: 'Error en obtenir els jugadors' });
        });
});

app.get('/jugador', async (req, res) => {
    try {
        const { nom, password } = req.body;

        if (!nom || !password) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const jugador = await Jugador.findOne({ where: { nom } });

        if (jugador && await bcrypt.compare(password, jugador.hash)) {
            const { hash, ...jugadorSenseHash } = jugador.toJSON();
            return res.status(200).json(jugadorSenseHash);
        } else {
            return res.status(401).json({ error: 'Nom o contrasenya incorrectes' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en iniciar sessió' });
    }
});

app.post('/jugador', async (req, res) => {
    try {
        const { nom, password } = req.body;

        if (!nom || !password) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const jugadorExist = await Jugador.findOne({ where: { nom } });
        if (jugadorExist) {
            return res.status(409).json({ error: 'El nom ja existeix' });
        }

        const hash = await bcrypt.hash(password, 10);

        const nouJugador = await Jugador.create({ nom, hash });

        const { hash: _, ...jugadorSenseHash } = nouJugador.toJSON();

        res.status(201).json(jugadorSenseHash);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en crear el jugador' });
    }
});

app.get('/personatge', async (req, res) => {
    try {
        const personatges = await Personatge.findAll();
        res.status(200).json(personatges);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en obtenir els personatges' });
    }
});

app.post('/personatge', upload.single('imatge'), async (req, res) => {
    try {
        const { nom, velocitat, forçaExplosions, bombesSimultanies } = req.body;

        if (!nom || !velocitat || !forçaExplosions || !bombesSimultanies) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const personatgeExist = await Personatge.findOne({ where: { nom } });
        if (personatgeExist) {
            return res.status(409).json({ error: 'El nom ja existeix' });
        }

        const nouPersonatge = await Personatge.create({ nom, velocitat, forçaExplosions, bombesSimultanies });

        const imatgePath = path.join('./sprites', `${nouPersonatge.id}.png`);
        fs.renameSync(req.file.path, imatgePath);

        res.status(201).json(nouPersonatge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en crear el personatge' });
    }
});

app.put('/personatge', upload.single('imatge'), async (req, res) => {
    try {
        const { id, nom, velocitat, forçaExplosions, bombesSimultanies } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'ID del personatge és obligatori' });
        }

        const personatge = await Personatge.findByPk(id);

        if (!personatge) {
            return res.status(404).json({ error: 'Personatge no trobat' });
        }

        if (req.file) {
            const oldImagePath = path.join('./sprites', `${id}.png`);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }

            const newImagePath = path.join('./sprites', `${id}.png`);
            fs.renameSync(req.file.path, newImagePath);
        }

        await personatge.update({
            nom: nom ?? personatge.nom,
            velocitat: velocitat ?? personatge.velocitat,
            forçaExplosions: forçaExplosions ?? personatge.forçaExplosions,
            bombesSimultanies: bombesSimultanies ?? personatge.bombesSimultanies,
        });

        res.status(200).json(personatge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en actualitzar el personatge' });
    }
});


app.get('/partida', async (req, res) => {
    try {
        const partides = await Partida.findAll();
        res.status(200).json(partides);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en obtenir les partides' });
    }
});

app.get('/partida', async (req, res) => {
    try {
        const { id } = req.query;
        const partida = await Partida.findByPk(id);
        if (!partida) {
            return res.status(404).json({ error: 'Partida no trobada' });
        }
        res.status(200).json(partida);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en obtenir la partida' });
    }
});

app.post('/partida', async (req, res) => {
    try {
        const { jugador1, jugador2, codi_partida } = req.body;

        if (!jugador1 || !jugador2 || !codi_partida) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const novaPartida = await Partida.create({ jugador1, jugador2, codi_partida });

        res.status(201).json(novaPartida);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en crear la partida' });
    }
});

// fer endpoints per guanyar (un put de partida per 
// posar el guanyador i acabar la partida i tambe posar-li la victoria al guanyador

// endpoints per kills i morts


process.on('message', (message) => {
    if (message.action === 'start') {
        sequelize.sync({ alter: true })
            .then(() => {
                console.log('Base de dades sincronitzada correctament');
                app.listen(port, () => {
                    console.log(`Servei de Sequelize corrent a ${port}`);
                }).on('error', (err) => {
                    if (err.code === 'EADDRINUSE') {
                        console.log(`El port ${port} ja està en ús, però el servidor està funcionant.`);
                    } else {
                        console.error(err);
                    }
                });
            })
            .catch((error) => {
                console.error('Error sincronitzant la base de dades:', error);
            });
    }
    if (message.action === 'stop') {
        process.send('exit')
        process.exit();
    }
});