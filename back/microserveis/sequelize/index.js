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
const cors = require('cors');
app.use(cors());
app.use(express.json({ limit: '10mb', type: 'application/json', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ type: 'application/json', charset: 'utf-8' }));
const sharp = require('sharp');


dotenv.config({ path: path.resolve(__dirname, '../.env') });
const portLocal = process.env.PORT_NODE_SEQUELIZE_LOCAL;
const portProd = process.env.PORT_NODE_SEQUELIZE_PRODUCCIO;
const hostLocal = "mysql"
const hostProd = "localhost"

const port = portProd;
const host = hostProd;

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE,
    process.env.MYSQL_USER,
    process.env.MYSQL_PASSWORD,
    {
        host: host || 'mysql',
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
Personatge.hasMany(Partida, { foreignKey: 'idPersonatgeGuanyador', as: 'partidesGuanyades' });
Personatge.hasMany(Partida, { foreignKey: 'idPersonatgePerdedor', as: 'partidesPerdudes' });
Partida.belongsTo(Jugador, { foreignKey: 'jugador1', as: 'Jugador1' });
Partida.belongsTo(Jugador, { foreignKey: 'jugador2', as: 'Jugador2' });
Partida.belongsTo(Personatge, { foreignKey: 'idPersonatgeGuanyador', as: 'PersonatgeGuanyador' });
Partida.belongsTo(Personatge, { foreignKey: 'idPersonatgePerdedor', as: 'PersonatgePerdedor' });


module.exports = { sequelize, Jugador, Partida, Personatge };

app.use('/sprites', express.static(path.join(__dirname, 'sprites')));
app.use('/builds', express.static(path.join(__dirname, 'builds')));

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

app.delete('/jugador', async (req, res) => {
    try {
        const { idUsuari } = req.body;
        if (!idUsuari){
            return res.status(400).json({ error: 'ID del jugador és obligatori' });
        } else {
            const jugador = await Jugador.findByPk(idUsuari);
            if (!jugador) {
                return res.status(404).json({ error: 'Jugador no trobat' });
            }
            await jugador.destroy();
            res.status(200).json({ message: 'Jugador eliminat' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en eliminar el jugador' });
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
        const { nom, velocitat, forcaExplosions, bombesSimultanies } = req.body;
        if (!nom || !velocitat || !forcaExplosions || !bombesSimultanies) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const personatgeExist = await Personatge.findOne({ where: { nom } });
        if (personatgeExist) {
            return res.status(409).json({ error: 'El nom ja existeix' });
        }

        const nouPersonatge = await Personatge.create({ 
            nom, 
            velocitat, 
            forcaExplosions, 
            bombesSimultanies 
        });

        const spritesDir = path.join(__dirname, 'sprites');
        const targetPath = path.join(spritesDir, `${nouPersonatge.idPersonatge}.png`);

        if (req.file) {
            await sharp(req.file.path)
                .png()
                .toFile(targetPath, (err, info) => {
                    if (err) {
                        console.error("Error en convertir la imatge:", err);
                        return res.status(500).json({ error: 'Error en convertir la imatge' });
                    }
                    fs.unlinkSync(req.file.path);
                });
        } else {
            const defaultImage = path.join(spritesDir, 'imatgeError.png');
            fs.copyFileSync(defaultImage, targetPath); 
        }

        res.status(201).json(nouPersonatge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en crear el personatge' });
    }
});

app.put('/personatge', upload.single('imatge'), async (req, res) => {
    try {
        const { idPersonatge, nom, velocitat, forcaExplosions, bombesSimultanies } = req.body;

        if (!idPersonatge || !nom || !velocitat || !forcaExplosions || !bombesSimultanies) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const personatge = await Personatge.findByPk(idPersonatge);
        if (!personatge) {
            return res.status(404).json({ error: 'Personatge no trobat' });
        }

        personatge.nom = nom;
        personatge.velocitat = velocitat;
        personatge.forcaExplosions = forcaExplosions;
        personatge.bombesSimultanies = bombesSimultanies;

        await personatge.save();

        const spritesDir = path.join(__dirname, 'sprites');
        const targetPath = path.join(spritesDir, `${personatge.idPersonatge}.png`);

        if (req.file) {
            await sharp(req.file.path)
                .png()
                .toFile(targetPath, (err, info) => {
                    if (err) {
                        console.error("Error en convertir la imatge:", err);
                        return res.status(500).json({ error: 'Error en convertir la imatge' });
                    }
                    fs.unlinkSync(req.file.path);
                });
        }

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
        const { idPartida } = req.body;
        const partida = await Partida.findByPk(idPartida);
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
        const { jugador1, jugador2, duracio, idGuanyador, idPersonatgeGuanyador, idPersonatgePerdedor} = req.body;

        if (jugador1 === undefined || jugador2 === undefined || duracio === undefined || idGuanyador === undefined || idPersonatgeGuanyador === undefined || idPersonatgePerdedor === undefined) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const data = new Date();

        const novaPartida = await Partida.create({ data, duracio, jugador1, jugador2, idGuanyador, idPersonatgeGuanyador, idPersonatgePerdedor });

        res.status(201).json(novaPartida);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en crear la partida' });
    }
});

app.get('/seguentPartida', async (req, res) => {
    try {
        const lastPartida = await Partida.findOne({
            order: [['idPartida', 'DESC']]
        });

        const nextId = lastPartida ? lastPartida.idPartida + 1 : 1;

        res.send(nextId.toString());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en obtenir el següent ID de partida' });
    }
});

app.put('/guanyar' , async (req, res) => {
    try {
        const { idJugador } = req.body;

        if (!idJugador) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const jugador = await Jugador.findByPk(idJugador);
        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no trobat' });
        }

        jugador.victories += 1;

        await jugador.save();

        res.status(200).json(jugador);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en actualitzar la partida' });
    }
});

app.put('/perdre' , async (req, res) => {
    try {
        const { idJugador } = req.body;

        if (!idJugador) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const jugador = await Jugador.findByPk(idJugador);
        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no trobat' });
        }

        jugador.derrotes += 1;

        await jugador.save();

        res.status(200).json(jugador);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en actualitzar la partida' });
    }
});

app.put('/kill' , async (req, res) => {
    try {
        const { idJugador } = req.body;

        if (!idJugador) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const jugador = await Jugador.findByPk(idJugador);
        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no trobat' });
        }

        jugador.kills += 1;

        await jugador.save();

        res.status(200).json(jugador);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en actualitzar la partida' });
    }
});

app.put('/mort' , async (req, res) => {
    try {
        const { idJugador } = req.body;

        if (!idJugador) {
            return res.status(400).json({ error: 'Falten camps obligatoris' });
        }

        const jugador = await Jugador.findByPk(idJugador);
        if (!jugador) {
            return res.status(404).json({ error: 'Jugador no trobat' });
        }

        jugador.morts += 1;

        await jugador.save();

        res.status(200).json(jugador);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en actualitzar la partida' });
    }
});

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