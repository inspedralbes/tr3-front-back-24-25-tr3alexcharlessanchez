const urlLocal = import.meta.env.VITE_APP_URL_LOCAL;
const urlProd = import.meta.env.VITE_APP_URL_PRODUCCIO;
const portLocalSequelize = import.meta.env.VITE_APP_PORT_NODE_SEQUELIZE_LOCAL;
const portProdSequelize = import.meta.env.VITE_APP_PORT_NODE_SEQUELIZE_PROD;
const portLocalPython = import.meta.env.VITE_APP_PORT_NODE_PYTHON_LOCAL;
const portProdPython = import.meta.env.VITE_APP_PORT_NODE_PYTHON_PROD;

const url = urlProd;
const portSequelize = portProdSequelize;
const portPython = portProdPython;

async function getGrafics() {
    const a = await fetch(`${url}:${portPython}/winrate`);
    const b = await fetch(`${url}:${portPython}/podium`);
    const c = await fetch(`${url}:${portPython}/mitjanes`);
    return await Promise.all([a, b, c]);
}

async function getJugadors() {
    const response = await fetch(`${url}:${portSequelize}/jugadors`);
    return await response.json();
}

async function getJugador(nom, password) {
    const response = await fetch(`${url}:${portSequelize}/jugador`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ nom, password })
    });
    return await response.json();
}

async function createJugador(nom, password) {
    const response = await fetch(`${url}:${portSequelize}/jugador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ nom, password })
    });
    return await response.json();
}

async function deleteJugador(idUsuari) {
    const response = await fetch(`${url}:${portSequelize}/jugador`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ idUsuari })
    });
    return await response.json();
}

async function getPersonatges() {
    const response = await fetch(`${url}:${portSequelize}/personatge`);
    return await response.json();
}

async function createPersonatge(data, imatgeFile) {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    if (imatgeFile) {
        formData.append('imatge', imatgeFile);
    }

    const response = await fetch(`${url}:${portSequelize}/personatge`, {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

async function updatePersonatge(data, imatgeFile) {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    if (imatgeFile) {
        formData.append('imatge', imatgeFile);
    }

    const response = await fetch(`${url}:${portSequelize}/personatge`, {
        method: 'PUT',
        body: formData
    });
    return await response.json();
}

async function getPartides() {
    const response = await fetch(`${url}:${portSequelize}/partida`);
    return await response.json();
}

async function getPartida(id) {
    const response = await fetch(`${url}:${portSequelize}/partida`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ id })
    });
    return await response.json();
}

async function createPartida(jugador1, jugador2, idGuanyador, idPersonatgeGuanyador, idPersonatgePerdedor) {
    const response = await fetch(`${url}:${portSequelize}/partida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ jugador1, jugador2, idGuanyador, idPersonatgeGuanyador, idPersonatgePerdedor })
    });
    return await response.json();
}

export {
    getJugadors,
    getJugador,
    createJugador,
    deleteJugador,
    getPersonatges,
    createPersonatge,
    updatePersonatge,
    getPartides,
    getPartida,
    createPartida,
    getGrafics
};