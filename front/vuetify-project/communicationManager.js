const urlLocal = import.meta.env.VITE_APP_URL_LOCAL;
const urlProd = import.meta.env.VITE_APP_URL_PRODUCCIO;
const portLocal = import.meta.env.VITE_APP_PORT_NODE_SEQUELIZE_LOCAL;
const portProd = import.meta.env.VITE_APP_PORT_NODE_SEQUELIZE_PROD;

const url = urlProd;
const port = portProd;

// GET /jugadors
async function getJugadors() {
    const response = await fetch(`${url}:${port}/jugadors`);
    return await response.json();
}

// GET /jugador amb nom i password (la implementació al servidor espera el body)
async function getJugador(nom, password) {
    const response = await fetch(`${url}:${port}/jugador`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ nom, password })
    });
    return await response.json();
}

// POST /jugador per crear un nou jugador
async function createJugador(nom, password) {
    const response = await fetch(`${url}:${port}/jugador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ nom, password })
    });
    return await response.json();
}

// DELETE /jugador per eliminar un jugador
async function deleteJugador(idUsuari) {
    const response = await fetch(`${url}:${port}/jugador`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ idUsuari })
    });
    return await response.json();
}

// GET /personatge per obtenir tots els personatges
async function getPersonatges() {
    const response = await fetch(`${url}:${port}/personatge`);
    return await response.json();
}

// POST /personatge per crear un personatge amb imatge (s'utilitza FormData)
async function createPersonatge(data, imatgeFile) {
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    if (imatgeFile) {
        formData.append('imatge', imatgeFile);
    }

    const response = await fetch(`${url}:${port}/personatge`, {
        method: 'POST',
        body: formData
    });
    return await response.json();
}

// PUT /personatge per actualitzar un personatge amb possible imatge nova
async function updatePersonatge(data, imatgeFile) {
    // 'data' ha d'incloure l'id del personatge i els altres camps opcionals
    const formData = new FormData();
    for (const key in data) {
        formData.append(key, data[key]);
    }
    if (imatgeFile) {
        formData.append('imatge', imatgeFile);
    }

    const response = await fetch(`${url}:${port}/personatge`, {
        method: 'PUT',
        body: formData
    });
    return await response.json();
}

// GET /partida per obtenir totes les partides
async function getPartides() {
    const response = await fetch(`${url}:${port}/partida`);
    return await response.json();
}

// GET /partida per obtenir una partida per id (seguint la implementació del servidor que rep id al body)
async function getPartida(id) {
    const response = await fetch(`${url}:${port}/partida`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ id })
    });
    return await response.json();
}

// POST /partida per crear una nova partida
async function createPartida(jugador1, jugador2, idGuanyador, idPersonatgeGuanyador, idPersonatgePerdedor) {
    const response = await fetch(`${url}:${port}/partida`, {
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
    createPartida
};