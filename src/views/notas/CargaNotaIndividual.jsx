import React, { useState } from 'react';
import {
    CCard, CCardHeader, CCardBody, CCardFooter, CButton, CForm, CRow, CCol,
    CFormLabel, CFormSelect, CFormInput, CSpinner, CAlert, CContainer
} from '@coreui/react';

import CIcon from '@coreui/icons-react';
import { cilSave, cilCheckCircle, cilWarning } from '@coreui/icons';

import api from '../../api/api';

import { createNota } from '../../api/api';

// Importamos el hook para leer datos de alumnos de la BD
import { useStudentsData } from '../../hooks/useStudentsData'

// --- MOCK DATA: Simulación de datos que vendrían del Backend ---
// En el futuro, estos datos se cargarán con useEffect y llamadas a la API
// En la app real se cargaran al inicio con useEffect)
const mockData = {

    //  alumnos: [..]   Se obtiene del hook

    materias: [
        { id: 1, nombre_materia: 'Matemáticas' },
        { id: 2, nombre_materia: 'Literatura' },
        { id: 3, nombre_materia: 'Programación' },
    ],
    periodos: [
        { id: 1, descripcion: '1er Trimestre' },
        { id: 2, descripcion: '2do Trimestre' },
        { id: 3, descripcion: 'Final Anual' },
    ],
    // Año no es un select en la base, pero lo incluimos para el formulario (lo usaremos para el futuro filtro)
    anos: [2024, 2025, 2026],
};


export default function CargarNotaIndividual() {

    //  Usampos el hook para traer los datos de los alumnos
    const { studentsData, loading: loadingStudents } = useStudentsData()


    // Estados para capturar los datos del formulario
    const [formData, setFormData] = useState({
        id_entidad_estudiante: '', // Alumno
        id_materia: '', // Materia
        id_periodo: '', // Período
        ano: new Date().getFullYear(), // Año actual por defecto
        nota: '', // Nota
        // id_entidad_carga: 2, // ID de quien carga (ejemplo, usuario logueado)
        // id_tipo_nota: 1, // Tipo de nota (ejemplo, "Calificación Normal")
    });

    // Estados para el UX (Carga y Resultado)
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success'|'error', message: '...' }

    // Manejador genérico de cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // Convertir la nota a número si es el campo 'nota'
            [name]: name === 'nota' ? parseFloat(value) : value,
        }));
    };

    // FUNCIÓN DE ENVÍO DE DATOS AL BACKEND
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validamos que estén todos los datos necesarios para el formulario
        if (!formData.id_entidad_estudiante || !formData.id_materia || !formData.nota || !formData.id_periodo) {
            setStatus({ type: 'error', message: 'Debe seleccionar Alumno, Materia, Período y la Nota.' });
            return;
        }



        // INICIO DE LA LÓGICA DE API Y ESTADOS
        // --------------------------------------------------------------
        setIsLoading(true);
        setStatus(null);

        // Los datos que necesita el backend (NotaCreate)
        const payload = {
            id_entidad_estudiante: parseInt(formData.id_entidad_estudiante),
            id_materia: parseInt(formData.id_materia),
            id_periodo: parseInt(formData.id_periodo),
            nota: formData.nota,
            ano: parseInt(formData.ano),
        };
        try {
            const response = await api.post('/notas/', payload);
            if (!response.status === 201) {
                throw new Error('Error al guardar la nota');
            }

            console.log('Nota guardada exitosamente:', response.data);
            // Mensaje de éxito, resetear el form, etc. 
            alert('Nota cargada correctamente');
            // Mejora: usar un toast, setSuccess, etc.

        } catch (error) {
            console.error('Error al enviar la nota:', error);

            let mensaje = 'Error al guardar la nota';
            if (error.response) {
                // El servidor respondió con error (400, 422, 500, etc.)
                mensaje += `: ${error.response.data.detail || error.response.statusText}`;
            } else if (error.request) {
                // No llegó respuesta (servidor caído, CORS, red)
                mensaje = 'No se pudo conectar con el servidor';
            }

            alert(mensaje);
            // O usar un estado de error en el componente

        }
        setIsLoading(false);

    }



    return (
        <CContainer className="mt-3">
            <h1 className="ms-1">Carga de Nota Individual</h1>
            <CCard className="shadow-sm">
                <CCardHeader className="bg-primary text-white">
                    <h5>Selección de Parámetros</h5>
                </CCardHeader>
                <CCardBody>
                    <CForm onSubmit={handleSubmit}>

                        {/* 4. FEEDBACK DE ESTADO (AÑADIDO) */}
                        {status && (
                            <CAlert
                                color={status.type === 'success' ? 'success' : 'danger'}
                                className="mb-3"
                                icon={<CIcon icon={status.type === 'success' ? cilCheckCircle : cilWarning} />}
                            >
                                {status.message}
                            </CAlert>
                        )}

                        <CRow className="g-3">
                            {/* ... Controles de Alumno, Materia, Período, Año y Nota ... */}
                            {/* Columna 1: Alumno y Materia */}
                            <CCol md={6}>
                                {/* Configuramos el Select de Alumnos */}
                                <CFormLabel htmlFor="id_entidad_estudiante">
                                    Alumno <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormSelect
                                    id="id_entidad_estudiante"
                                    name="id_entidad_estudiante"
                                    value={formData.id_entidad_estudiante}
                                    onChange={handleChange}
                                    required
                                    disabled={loadingStudents} // Deshabilitamos si está cargando datos
                                >
                                    {/* Opción por defecto o mensaje de carga */}
                                    <option value="">
                                        {loadingStudents ? 'Cargando lista...' : 'Seleccione un alumno'}
                                    </option>


                                    {/* Mapeamos nombre y apellido de los alumnos*/}
                                    {/* Verificamos que studentsData sea un array antes de mapear (studentsData && ... )*/}
                                    {studentsData && studentsData.map(alumno => (
                                        <option 
                                            key={alumno.id} 
                                            value={alumno.id}>
                                            {alumno.apellido}, {alumno.nombre}  {/* Mostramos Apellido, Nombre */}
                                        </option>
                                    ))}


                                </CFormSelect>
                            </CCol>

                            <CCol md={6}>
                                {/* SELECCIONAR MATERIA */}
                                <CFormLabel htmlFor="id_materia">
                                    Materia <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormSelect
                                    id="id_materia"
                                    name="id_materia"
                                    value={formData.id_materia}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccione una materia</option>
                                    {mockData.materias.map(materia => (
                                        <option key={materia.id} value={materia.id}>
                                            {materia.nombre_materia}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            {/* Columna 2: Período y Año */}
                            <CCol md={6}>
                                {/* SELECCIONAR PERÍODO */}
                                <CFormLabel htmlFor="id_periodo">
                                    Período <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormSelect
                                    id="id_periodo"
                                    name="id_periodo"
                                    value={formData.id_periodo}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccione un período</option>
                                    {mockData.periodos.map(periodo => (
                                        <option key={periodo.id} value={periodo.id}>
                                            {periodo.descripcion}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            <CCol md={6}>
                                {/* SELECCIONAR AÑO */}
                                <CFormLabel htmlFor="ano">
                                    Año
                                </CFormLabel>
                                <CFormSelect
                                    id="ano"
                                    name="ano"
                                    value={formData.ano}
                                    onChange={handleChange}
                                >
                                    {mockData.anos.map(a => (
                                        <option key={a} value={a}>
                                            {a}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            {/* Columna 3: Nota */}
                            <CCol xs={12}>
                                <CFormLabel htmlFor="nota">
                                    Nota (Ej: 1.0 a 10.0) <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="nota"
                                    name="nota"
                                    type="number"
                                    step="0.5" // Permite notas con medio punto
                                    min="1.0"
                                    max="10.0"
                                    value={formData.nota}
                                    onChange={handleChange}
                                    placeholder="Ej: 8.5"
                                    required
                                />
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
                <CCardFooter className="d-flex justify-content-end">
                    <CButton color="success" type="submit" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <CSpinner size="sm" component="span" aria-hidden="true" className="me-2" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <CIcon icon={cilSave} className="me-2" />
                                Guardar Nota
                            </>
                        )}

                    </CButton>
                </CCardFooter>
            </CCard>
        </CContainer>
    );

}