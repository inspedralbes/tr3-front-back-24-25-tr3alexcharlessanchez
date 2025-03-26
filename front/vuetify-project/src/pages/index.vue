<template>
  <div class="page-container">
    <div class="cards-container">
      <!-- Cards de personatges existents -->
      <div v-for="personatge in personatges" :key="personatge.id" class="card">
        <h3><u>{{ personatge.nom }}</u></h3>
        <p>
          <strong>Velocitat: </strong>
          <span class="velocitat"><b>{{ personatge.velocitat }}</b></span>
        </p>
        <p>
          <strong>Força Explosions: </strong>
          <span class="forca"><b>{{ personatge.forcaExplosions }}</b></span>
        </p>
        <p>
          <strong>Bombes Simultànies: </strong>
          <span class="bombes"><b>{{ personatge.bombesSimultanies }}</b></span>
        </p>
        <img :src="getImageUrl(personatge.idPersonatge)" alt="Imatge personatge" class="card-image">
        <!-- Botó per editar -->
        <button class="edit-btn" @click="openEditForm(personatge)">Edita</button>
      </div>

      <!-- Card amb creu per afegir un nou personatge -->
      <div @click="openForm" class="card add-card">
        <span class="add-icon">+</span>
        <p>Afegeix un nou personatge</p>
      </div>
    </div>

    <!-- Diàleg per afegir un nou personatge -->
    <div v-if="isFormOpen" class="modal">
      <div class="modal-content">
        <span @click="closeForm" class="close-btn">&times;</span>
        <h3>Afegir Personatge</h3>
        <form @submit.prevent="submitForm">
          <meta charset="UTF-8">
          <label for="nom">Nom:</label>
          <input type="text" id="nom" v-model="newPersonatge.nom" required placeholder="Nom del personatge" />

          <label for="velocitat">Velocitat:</label>
          <input type="number" id="velocitat" v-model="newPersonatge.velocitat" required placeholder="Velocitat" />

          <label for="forçaExplosions">Força Explosions:</label>
          <input type="number" id="forçaExplosions" v-model="newPersonatge.forcaExplosions" required placeholder="Força Explosions" />

          <label for="bombesSimultanies">Bombes Simultànies:</label>
          <input type="number" id="bombesSimultanies" v-model="newPersonatge.bombesSimultanies" required placeholder="Bombes Simultànies" />

          <label for="imatge">Imatge:</label>
          <input type="file" id="imatge" @change="handleImageUpload" />

          <button type="submit">Crear Personatge</button>
        </form>
      </div>
    </div>

    <!-- Diàleg per editar un personatge -->
    <div v-if="isEditFormOpen" class="modal">
      <div class="modal-content">
        <span @click="closeEditForm" class="close-btn">&times;</span>
        <h3>Edita Personatge</h3>
        <form @submit.prevent="submitEditForm">
          <meta charset="UTF-8">
          <label for="edit-nom">Nom:</label>
          <input type="text" id="edit-nom" v-model="editedPersonatge.nom" required placeholder="Nom del personatge" />

          <label for="edit-velocitat">Velocitat:</label>
          <input type="number" id="edit-velocitat" v-model="editedPersonatge.velocitat" required placeholder="Velocitat" />

          <label for="edit-forca">Força Explosions:</label>
          <input type="number" id="edit-forca" v-model="editedPersonatge.forcaExplosions" required placeholder="Força Explosions" />

          <label for="edit-bombes">Bombes Simultànies:</label>
          <input type="number" id="edit-bombes" v-model="editedPersonatge.bombesSimultanies" required placeholder="Bombes Simultànies" />

          <label for="edit-imatge">Imatge (nova opcional):</label>
          <input type="file" id="edit-imatge" @change="handleEditImageUpload" />

          <button type="submit">Actualitza Personatge</button>
        </form>
      </div>
    </div>
    <div class="page-container">
    <h2 style="color: black;">Llista de Jugadors</h2>
    <table class="jugadors-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nom</th>
          <th>Victòries</th>
          <th>Derrotes</th>
          <th>Morts</th>
          <th>Kills</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="jugador in jugadors" :key="jugador.idUsuari">
          <td>{{ jugador.idUsuari }}</td>
          <td>{{ jugador.nom }}</td>
          <td>{{ jugador.victories }}</td>
          <td>{{ jugador.derrotes }}</td>
          <td>{{ jugador.morts }}</td>
          <td>{{ jugador.kills }}</td>
          <td> 
            <button class="eliminar" @click="eliminarUsuari(jugador.idUsuari)">X</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPersonatges, createPersonatge, updatePersonatge, getJugadors, deleteJugador } from "../../communicationManager.js";

// Variables per a l'API
const urlLocal = import.meta.env.VITE_APP_URL_LOCAL;
const urlProd = import.meta.env.VITE_APP_URL_PRODUCCIO;
const portLocal = import.meta.env.VITE_APP_PORT_NODE_SEQUELIZE_LOCAL;
const portProd = import.meta.env.VITE_APP_PORT_NODE_SEQUELIZE_PROD;
const url = urlProd;
const port = portProd;
const baseUrl = `${url}:${port}`;

const personatges = ref([]);
const jugadors = ref([]);
const isFormOpen = ref(false);
const isEditFormOpen = ref(false);

// Variables per crear i editar
const newPersonatge = ref({
  nom: '',
  velocitat: 0,
  forcaExplosions: 0,
  bombesSimultanies: 0
});
const editedPersonatge = ref({
  id: null,
  nom: '',
  velocitat: 0,
  forcaExplosions: 0,
  bombesSimultanies: 0
});

const selectedImage = ref(null);
const selectedEditImage = ref(null);

async function eliminarUsuari(idUsuari) {
  await deleteJugador(idUsuari);
  const jugadorsActualitzats = await getJugadors();
  jugadors.value = jugadorsActualitzats;
}

// Funció per obtenir la URL de la imatge del personatge
function getImageUrl(id) {
  return `${baseUrl}/sprites/${id}.png`;
}

// Funció per obrir el formulari de creació
function openForm() {
  isFormOpen.value = true;
}

// Funció per tancar el formulari de creació
function closeForm() {
  isFormOpen.value = false;
  resetForm();
}

// Funció per restablir el formulari de creació
function resetForm() {
  newPersonatge.value = {
    nom: '',
    velocitat: 0,
    forcaExplosions: 0,
    bombesSimultanies: 0
  };
  selectedImage.value = null;
}

// Funció per manejar la càrrega de la imatge de creació
function handleImageUpload(event) {
  selectedImage.value = event.target.files[0];
}

// Funció per enviar el formulari de creació
async function submitForm() {
  try {
    const resposta = await createPersonatge(newPersonatge.value, selectedImage.value);
    personatges.value.push(resposta);
    closeForm();
  } catch (error) {
    console.error("Error en crear el personatge:", error);
  }
}

// Funció per obrir el formulari d'edició amb les dades actuals
function openEditForm(personatge) {
  editedPersonatge.value = { ...personatge }; // Copia les dades
  isEditFormOpen.value = true;
}

// Funció per tancar el formulari d'edició
function closeEditForm() {
  isEditFormOpen.value = false;
  resetEditForm();
}

// Funció per restablir el formulari d'edició
function resetEditForm() {
  editedPersonatge.value = {
    id: null,
    nom: '',
    velocitat: 0,
    forcaExplosions: 0,
    bombesSimultanies: 0
  };
  selectedEditImage.value = null;
}

// Funció per manejar la càrrega de la imatge d'edició
function handleEditImageUpload(event) {
  selectedEditImage.value = event.target.files[0];
}

// Funció per enviar el formulari d'edició
async function submitEditForm() {
  try {
    const resposta = await updatePersonatge(editedPersonatge.value, selectedEditImage.value);
    const index = personatges.value.findIndex(p => p.id === editedPersonatge.value.id);
    if (index !== -1) {
      personatges.value.splice(index, 1, resposta);
    }
    closeEditForm();
  } catch (error) {
    console.error("Error en actualitzar el personatge:", error);
  }
}

// Carregar els personatges existents en muntar el component
onMounted(async () => {
  try {
    const resposta = await getPersonatges();
    personatges.value = resposta;
  } catch (error) {
    console.error("Error en obtenir els personatges:", error);
  }
  try {
    const resposta = await getJugadors();
    jugadors.value = resposta;
  } catch (error) {
    console.error("Error en obtenir els jugadors:", error);
  }
});
</script>

<style scoped>
.page-container {
  background-color: #f0f0f0;
  min-height: 100vh;
  padding: 20px;
}

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}

.card {
  position: relative;
  border: 1px solid #ccc;
  padding: 20px;
  width: 320px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  background-color: #fff;
  color: #4d4d4d;
}

.edit-btn {
  margin-top: 12px;
  background-color: #ffc107;
  color: #333;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: #e0a800;
}

.add-card {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 2px dashed #ccc;
  background-color: #f9f9f9;
  width: 320px;
  height: 220px;
  text-align: center;
  border-radius: 8px;
}

.add-icon {
  font-size: 40px;
  color: #007bff;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

form {
  display: flex;
  flex-direction: column;
}

/* Estils per fer els labels més visibles */
form label {
  color: #333;
  font-weight: bold;
  margin-bottom: 4px;
  text-align: left;
}

input[type="text"],
input[type="number"],
input[type="file"] {
  margin-bottom: 12px;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  color: #333;
}

input::placeholder {
  color: #888;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #0056b3;
}

.card-image {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: contain;
  margin-top: 16px;
  border-radius: 4px;
}

.page-container {
  padding: 20px;
}

.jugadors-table {
  width: 100%;
  border-collapse: collapse;
}

.jugadors-table th,
.jugadors-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
  color: #333;
}

.jugadors-table th {
  background-color: #f4f4f4;
}
.eliminar{
  background-color: red;
}
</style>
