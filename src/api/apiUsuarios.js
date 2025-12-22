// src\api\apiUsuarios.js

import api from './api.js'; // Importamos la instancia configurada de axios (con interceptores, baseURL, etc.)

const ENDPOINT = '/api/usuarios'; // Endpoint base específico

//   ---------- Funciones CRUD para Usuarios   ----------

//  Obtiene todos los usuarios [getAll]
export const getAll = () => api.get(ENDPOINT);

//   Obtiene un usuario específico por ID [get]
export const get = (id) => api.get(`${ENDPOINT}/${id}`);

//   Crea un nuevo usuario [create]
export const create = (usuarioData) => api.post(`${ENDPOINT}/`, usuarioData);

//  Actualiza un usuario existente [update]
export const update = (id, usuarioData) => api.put(`${ENDPOINT}/${id}`, usuarioData);

//  Elimina un usuario [remove] 
export const remove = (id) => api.delete(`${ENDPOINT}/${id}`);


// Exportamos todas las funciones CRUD bajo un objeto para ser consumido por useGenericCrud
const apiUsuarios = {
    getAll,
    get,
    create,
    update,
    remove,
};

export default apiUsuarios;