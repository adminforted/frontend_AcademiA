//   frontend_AcademiA\src\hooks\useUsuariosData.js

import { useState, useEffect, useCallback } from 'react'
import apiUsuarios from '../api/apiUsuarios'

export const useUsuariosData = () => {

    // Datos de usuarios obtenidos del backend.
    const [usuariosData, setUsuariosData] = useState([])


    // Estado de carga (loading) útil para la UI
    const [loading, setLoading] = useState(false)

    // Estado de error(error)
    const [error, setError] = useState(null)

    // Función para obtener datos de usuarios (fetchUsuarios)
    // Usamos useCallback para que esta función no se recree en cada renderizado
    const fetchUsuarios = useCallback(async () => {
        setLoading(true)    // Activamos el modo "cargando"
        setError(null)   // Limpiamos errores previos

        try {
            // Llamada a la API
            const response = await apiUsuarios.getAll()

            // Lógica de validación
            const { data } = response


            // Info de data. Para depuración
            console.log("--- ESTADO DEL HOOK ---")
            console.log("Cargando:", loading)
            console.log("Datos recibidos (data):", data)


            if (Array.isArray(data)) {
                setUsuariosData(data)
            } else {
                console.error('El formato de datos no es un array:', data)
                setUsuariosData([])
            }
        } catch (error) {
            console.error('Error al obtener usuarios:', error)
            if (error.response) {
                console.error('Detalles del error:', error.response.data)
            }
        } finally {
            // Desactivamos el modo "cargando"
            setLoading(false)
        }
    }, [])

    // useEffect para cargar los datos automáticamente al montar el hook
    // Se jecuta una sola vez, y llama la función fetchUsuarios automáticamente.
    useEffect(() => {
        fetchUsuarios()
    }, [fetchUsuarios])

    // RETORNO: los datos obtenidos de la base de datos
    return {
        usuariosData,       // La lista de usuarios
        setUsuariosData,    // IMPORTANTE: Lo devolvemos para que se pueda modificar la tabla desde fuera (ej: al borrar)
        loading,         // Para saber si mostrar el spinner
        error,           // Para saber si falló
        fetchUsuarios // Por si se desea añadir un botón de "Recargar tabla" manual
    }


}

