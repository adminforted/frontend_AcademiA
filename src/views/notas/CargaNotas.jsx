//  frontend_AcademiA\src\views\notas\CargaNotas.jsx

import React, { useState, useEffect } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer, CFormInput, CFormLabel, } from '@coreui/react'

import GenericTable from '../../components/usersTable/GenericTable.jsx'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'

//   Para cargar la planilla modelo
import ModeloPlanilla from './Modelo_Planilla.jsx'

//  Importar hook para obtener notas de los estudiantes
import { usePlanillaCalificaciones } from '../../hooks/useCalificaciones.js';

// Importar configuración de columnas
import { getTableColumns } from '../../utils/columns.js'

//  Importamos el servicio apiMaterias que contiene las funciones getCiclosAll y getMateriasCurso
import apiMaterias, { getCiclosAll, getMateriasCurso } from '../../api/apiMaterias.jsx'

//  Importamos el servicio apiCursos
import apiCursos, { getCursosAll, getCursosCiclo } from '../../api/apiCursos.jsx'


// Estado inicial para filtros
const initialFilters = []

// Importar componentes reutilizables
import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import AdvancedFilters from '../../components/advancedFilters/AdvancedFilters.jsx'
import TableActions from '../../components/tableActions/TableActions.jsx'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'

import '../../css/PersonalStyles.css'

export default function CargaNotaAlumno() {


    const [unitCharge, setUnitCharge] = useState(false);

    const [formData, setFormData] = useState({
        nota: 8.5, // Valor inicial
        alumno: '',
        tipo: ''
    });

    // Usamos el hook para traer datos y los desestructuramos
    /*
    const {
        studentsData: tableData,
        setStudentsData: setTableData,
        loading
    } = useStudentsData();

    */

    // ---------- Estados para Ciclos ----------
    const [ciclos, setCiclos] = useState([]);   //  Guardamos los datos obtenidos de la api ciclos
    const [selectedCicloId, setSelectedCicloId] = useState(""); // Guardamos el ciclo seleccionado

    // ---------- Estados para Cursos ----------
    const [cursos, setCursos] = useState([]);   //  Lista de Cursos para el Select
    const [selectedCursoId, setSelectedCursoId] = useState("");   //  Lista de Cursos para el Select

    // ---------- Estados para Materias ----------
    const [materias, setMaterias] = useState([]);   //  Lista de Materias para el Select
    const [materiaId, setMateriaId] = useState("");   //  ID Materia Seleccionada


    const {
        data: tableData,
        loading,
        error
    } = usePlanillaCalificaciones(materiaId, ciclos);

    console.log('materiaId:', materiaId);
    console.log('tableData:', tableData);
    console.log('loading:', loading);
    console.log('error:', error);


    // Manejador genérico de cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // Convertir la nota a número si es el campo 'nota'
            [name]: name === 'nota' ? parseFloat(value) : value,
        }));
    };

    // ---------- Estados principales ----------
    const [searchTerm, setSearchTerm] = useState('') // Búsqueda global
    const [columnFilters, setColumnFilters] = useState(initialFilters) // Filtros por columna
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }) // Paginación
    const [sorting, setSorting] = useState([]) // Ordenamiento


    // ==================== CARGAR LOS CICLOS AL MONTAR EL COMPONENTE ====================
    useEffect(() => {
        const fetchCiclos = async () => {
            try {
                const response = await apiMaterias.getCiclosAll();  // Ejecuto la apiMaterias.getCiclos
                setCiclos(response.data);   // Guardo los datos en la variable ciclos
            } catch (err) {
                console.error("Error al cargar ciclos lectivos:", err);
            }
        };
        fetchCiclos();
    }, []);




    // ==================== CARGAR LOS CURSOS CADA VEZ QUE selectedCicloId CAMBIA     ====================
    useEffect(() => {
        const cargarCursos = async () => {

            // Si el usuario selecciona "Seleccionar Ciclo" (valor ""), limpiamos cursos
            if (!selectedCicloId || selectedCicloId === "0") {
                setCursos([]);
                setSelectedCursoId('');
                return;
            }

            try {
                // Ejecuto la apiCursos.getCursosCiclo pasando como parámetro el selectedCicloId
                const response = await apiCursos.getCursosCiclo(selectedCicloId);
                setCursos(response.data);   // Guardo los datos en la variable Cursos
                setSelectedCursoId(''); // Reseteamos el cursoId al cambiar de ciclo
            } catch (err) {
                console.error("Error al Traer cursos del ciclo:", err);
            }
        };
        cargarCursos();
    }, [selectedCicloId]); // <--- La "llave" que dispara el efecto


    // ==================== CARGAR LAS MATERIAS CADA VEZ QUE selectedCursoID CAMBIA     ====================
    useEffect(() => {
        const cargarMaterias = async () => {

            // Si el usuario selecciona "Seleccionar Curso" (valor ""), limpiamos Materias
            if (!selectedCursoId || selectedCursoId === "0") {
                setMaterias([]);
                setMateriaId('');
                return;
            }

            try {
                // Ejecuto la api routes_materias.get_materias_curso pasando como parámetro el selectedCursoId
                const response = await apiMaterias.getMateriasCurso(selectedCursoId);
                setMaterias(response.data);   // Guardo los datos en la variable
                setMateriaId(''); // Reseteamos materiaId al cambiar de curso
            } catch (err) {
                console.error("Error al Traer Matrerias del curso:", err);
            }
        };
        cargarMaterias();
    }, [selectedCursoId]); // <--- La "llave" que dispara el efecto



    // ==================== CONFIGURACIÓN ESPECÍFICA DE COLUMNAS PARA CARGA NOTAS ====================
    const cargaNotasColumnsConfig = [
        { id: 'index', header: 'Nº', cell: ({ row }) => row.index + 1 },

        {
            accessorKey: 'apellido_nombre',
            id: 'alumno',
            header: 'Alumno/a',
            cell: ({ row }) => {
                const a = row.original.alumno;
                return `${a.apellido.toUpperCase()}, ${a.nombre.toUpperCase()}`;
            },
        },
        { accessorKey: '', header: '1ºT' },
        { accessorKey: '', header: '2ºT' },
        { accessorKey: '', header: '3ºT' },
        { accessorKey: '', header: 'Prom.' },
        { accessorKey: '', header: 'DIC.' },
        { accessorKey: '', header: 'FEB.' },
        { accessorKey: '', header: 'Calif. Def.' },
        { accessorKey: '', header: 'Observaciones' },
    ]

    // ==================== GENERACIÓN DE COLUMNAS CON FUNCIÓN REUTILIZABLE ====================

    const columns = getTableColumns(
        cargaNotasColumnsConfig,
        () => { }, // funciones vacías o null
        null,
        { showSelection: false, showActions: false }
    )

    // ---------- Configuración de TanStack Table ----------
    const table = useReactTable({
        data: tableData || [], // Por seguridad, por si los datos son nulos
        columns,
        getCoreRowModel: getCoreRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setSearchTerm,
        onColumnFiltersChange: setColumnFilters,
        state: {
            pagination,
            sorting,
            globalFilter: searchTerm,
            columnFilters,
        },
    })



    // ==================== DATOS DERIVADOS PARA MOSTRAR E ====================
    // Calculamos una sola vez los objetos completos seleccionados
    const cicloSeleccionado = ciclos.find(c => c.id_ciclo_lectivo === parseInt(selectedCicloId))
    const cursoSeleccionado = cursos.find(c => c.id_curso === parseInt(selectedCursoId))
    const materiaSeleccionada = materias.find(m => m.id_materia === parseInt(materiaId))

    // Extraemos los valores que vamos a mostrar
    const datosPlanilla = {
        ciclo: cicloSeleccionado?.nombre_ciclo_lectivo || 'Sin seleccionar',
        curso: cursoSeleccionado?.curso || 'Sin seleccionar',
        turno: cursoSeleccionado?.turno || 'Sin seleccionar',
        materia: materiaSeleccionada?.nombre_rel?.nombre_materia || 'Sin seleccionar',
        // Puedes agregar más datos aquí según necesites
        // docente: materiaSeleccionada?.docente || 'Sin asignar',
        fecha: new Date().toLocaleDateString()
    }



    return (
        <div>

            {/* ----------  BODY --------------- */}
            {/* CONFIGURACIÓN (Mantenida del estilo original para contexto) */}
            <CCard className="mb-4 no-print shadow-sm">
                <CCardHeader className="fw-semibold bg-white">
                    Filtros de Selección
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">

                        <CCol md={3}>
                            <label className="form-label text-uppercase small fw-semibold text-secondary">Ciclo Lectivo</label>
                            {/* Select Dinámico con los datos de la DB */}
                            <select
                                className="form-select"
                                value={selectedCicloId}
                                onChange={(e) => setSelectedCicloId(e.target.value)}
                            >
                                {/*  Primera opcióndel select */}
                                <option value="">Seleccionar Ciclo</option>

                                {/*  Mapeo las opciones restantes del select */}
                                {ciclos.map((ciclos) => (
                                    <option
                                        key={ciclos.id_ciclo_lectivo}
                                        value={ciclos.id_ciclo_lectivo}
                                    >
                                        {ciclos.nombre_ciclo_lectivo}
                                    </option>
                                ))}
                            </select>
                        </CCol>

                        <CCol md={3}>
                            <label className="form-label text-uppercase small fw-semibold text-secondary">Curso</label>
                            {/* Select Dinámico con los datos de la DB */}
                            <select
                                className="form-select"
                                value={selectedCursoId} // El estado que guarda el curso seleccionado
                                onChange={(e) => setSelectedCursoId(e.target.value)} // Actualiza el ID del curso al elegir
                                disabled={cursos.length === 0} // Se deshabilita si la lista está vacía
                            >
                                {/* Opción por defecto dinámica */}
                                <option value="">
                                    {cursos.length > 0 ? "Seleccionar Curso" : "Primero elija un Ciclo"}
                                </option>

                                {/* Mapeo de los cursos traídos del endpoint */}
                                {cursos.map((item) => (
                                    <option
                                        key={item.id_curso}
                                        value={item.id_curso}>
                                        {item.curso}
                                    </option>
                                ))}
                            </select>
                        </CCol>


                        <CCol md={3}>
                            <label className="form-label text-uppercase small fw-semibold text-secondary">Materia</label>
                            <select
                                className="form-select"
                                value={materiaId} // El estado que guarda la materia seleccionada
                                onChange={(e) => setMateriaId(e.target.value)}
                                disabled={materias.length === 0} // Se deshabilita si la lista está vacía
                            >
                                {/* Opción por defecto dinámica */}
                                <option value="">
                                    {materias.length > 0 ? "Seleccionar Materia" : "Primero elija un Curso"}
                                </option>

                                {/* Mapeo de las materias traídas del endpoint */}
                                {materias.map((item) => (
                                    <option
                                        key={item.id_materia}
                                        value={item.id_materia}>
                                        {item.nombre_rel.nombre_materia}
                                    </option>
                                ))}
                            </select>
                        </CCol>


                        <CCol md={3} className="d-flex align-items-end ">
                            <div className="form-check mb-0 text-nowrap">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="checkCargaIndividual"
                                    checked={unitCharge}  // Es mejor controlar el input con 'checked' vinculado al estado
                                    onChange={(e) => setUnitCharge(e.target.checked)} // Forma correcta de actualizar
                                />
                                <label
                                    className="form-check-label text-uppercase small fw-semibold text-secondary"
                                    htmlFor="checkCargaIndividual"
                                >
                                    Carga Individual
                                </label>
                            </div>
                        </CCol>
                    </CRow>
                    {unitCharge && (
                        <CRow className="g-3">
                            <CCol md={3}>
                                <label className="form-label text-uppercase small fw-semibold text-secondary">Alumno</label>
                                <select className="form-select">
                                    <option>Ruiz, Juan Carlos</option>
                                </select>
                            </CCol>
                            <CCol md={3}>
                                <label className="form-label text-uppercase small fw-semibold text-secondary">Tipo</label>
                                <select className="form-select">
                                    <option>1°T</option>
                                </select>

                            </CCol>
                            <CCol md={4}>
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
                    )}
                </CCardBody>
            </CCard>

            {/* VISTA PREVIA DEL INFORME (REPLICA DE LA IMAGEN) */}
            {!unitCharge && (
                <CCard className="shadow-sm">
                    <CCardHeader className="fw-semibold bg-white d-flex justify-content-between">
                        <span>Vista Previa del Acta</span>
                        <span className="text-muted small">Página 1 de 7</span>
                    </CCardHeader>

                    <CCardBody className="p-4" style={{ overflowX: 'auto' }}>

                        {/* Contenedor estilo "Hoja de Papel" */}
                        <div className="border p-3 mx-auto" style={{ minWidth: '800px', backgroundColor: '#fff' }}>

                            {/* ENCABEZADO DE LA PLANILLA */}
                            <CRow className="mb-3 align-items-center">
                                <CCol xs={2} className="text-center">
                                    {/* Placeholder para Logo */}
                                    <div className="bg-light border d-flex align-items-center justify-content-center" style={{ width: '60px', height: '80px', margin: '0 auto' }}>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>LOGO</small>
                                    </div>
                                </CCol>
                                <CCol xs={10}>
                                    <h5 className="text-center fw-bold mb-3">PLANILLAS DE CALIFICACIONES - CL: 2025</h5>

                                    {/* Grilla de Datos del Encabezado */}
                                    <div className="border">
                                        <CRow className="g-0 border-bottom">
                                            <CCol xs={6} className="p-1 border-end d-flex">
                                                <span className="fw-bold me-2">CURSO Y DIV.:</span>
                                                <span>5A</span>
                                            </CCol>
                                            <CCol xs={6} className="p-1 d-flex">
                                                <span className="fw-bold me-2">Turno</span>
                                                <span className="fst-italic">Mañana</span>
                                            </CCol>
                                        </CRow>

                                        <CRow className="g-0 border-bottom">
                                            <CCol xs={6} className="p-1 border-end d-flex">
                                                <span className="fw-bold me-2">ASIGNATURA:</span>
                                                <span>{datosPlanilla.materia} </span>
                                            </CCol>

                                            <CCol xs={6} className="p-1 d-flex">
                                                <span className="fw-bold me-2">Fecha</span>
                                                <span>{datosPlanilla.fecha}</span>
                                            </CCol>
                                        </CRow>

                                        <CRow className="g-0">
                                            <CCol xs={12} className="p-1 d-flex">
                                                <span className="fw-bold me-2">DOCENTE:</span>
                                                <span>Pablo S. Pannone</span>
                                            </CCol>
                                        </CRow>
                                    </div>
                                </CCol>
                            </CRow>

                            {/* TABLA DE NOTAS */}
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {/*< ModeloPlanilla /> */}
                                {/* Tabla de estudiantes */}
                                <GenericTable table={table} />
                            </div>
                        </div>

                    </CCardBody>
                </CCard>
            )}

            {/* ----------  /BODY --------------- */}


            {/* ----------  FOOTER --------------- */}
            <CCardFooter
                className="bg-white border-top px-3 py-1" >

                <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Sistema de Gestión Académica</span>
                    <span className="small text-muted">Impreso el: {new Date().toLocaleDateString()}</span>
                </div>

            </CCardFooter>

        </div>





    )


}