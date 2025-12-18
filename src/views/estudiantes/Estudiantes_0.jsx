//  src\views\estudiantes\Estudiantes.jsx
import React from 'react';
import { 
    CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer, 
    CInputGroup, CFormInput, CBadge, CSpinner 
} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilPlus, cilSearch, cilFilter } from '@coreui/icons';

// 1. Hook de Lógica Central (Modularidad)
import { useGenericCrud } from '../../hooks/useGenericCrud.js';

// 2. Importación ÚNICA de TODA la Configuración de la Entidad (Modularidad)
// La ruta '../config/StudentConfig.js' se corrige para tu estructura.
import { 
    studentApi, 
    studentColumnsGetter, 
    studentFormFields, 
    studentFilterOptions, // Aunque no se usa directamente aquí, se mantiene para AdvancedFilters
    studentMetadata
} from "../../../src/config/StudentConfig.js"; 

// 3. Componentes Reutilizables (Modularidad)
import GenericTable from '../../components/usersTable/GenericTable.jsx';
import TablePagination from '../../components/tablePagination/TablePagination.jsx';
// Renombra tus modales si usas los nombres genéricos, sino ajusta la ruta:
import FormModal from '../../modals/ModalNewEdit.jsx'; // Ajustar según tu ruta real
import ConfirmationModal from '../../modals/ModalConfirmDel.jsx'; // Ajustar según tu ruta real


export default function Estudiante() {
    
    // Desestructuración del hook con la lógica, la data y los estados de UI
    const {
        table,
        data = { totalCount: 0, items: [] }, 
        isLoading, // Usado para el spinner (UX)
        searchTerm,
        setSearchTerm,
        columnFilters,
        setColumnFilters, // Se mantiene para manejar la lógica de filtros avanzados
        deleteModalVisible,
        setDeleteModalVisible,
        itemToDelete,
        handleDelete,
        editModalVisible,
        setEditModalVisible,
        itemToEdit,
        handleSave,
        handleClickNew,
    } = useGenericCrud(studentApi, studentColumnsGetter); 

    // UX: Variables para el conteo de registros y el indicador de filtros activos
    const totalCount = data.totalCount || 0; 
    const currentPageCount = table.getRowModel().rows.length;
    // Conteo de filtros activos para el Badge (asumiendo que 'value' es el criterio de filtro)
    const activeFilterCount = columnFilters.filter(f => f.value).length;

    return (
        <div className="p-3">
            <h1 className="ms-1">{studentMetadata.title}</h1>
            <CContainer fluid>
                <CCard className="mb-4 shadow-sm">

                    {/* INICIO: ENCABEZADO MEJORADO (UX: Título, Búsqueda y Acción Nuevo consolidados) */}
                    <CCardHeader className="py-3 bg-white border-bottom">
                        <CRow className="justify-content-between align-items-center">
                            
                            {/* Título y Subtítulo */}
                            <CCol xs={12} lg={4}>
                                <h4 id="titulo" className="mb-0">{studentMetadata.title}</h4>
                                <div className="small text-body-secondary">
                                    {studentMetadata.subtitle}
                                </div>
                            </CCol>
                            
                            {/* BÚSQUEDA Y FILTRO AVANZADO */}
                            <CCol xs={12} lg={5} className="mt-2 mt-lg-0">
                                <CInputGroup>
                                    <CFormInput
                                        placeholder={`Buscar ${studentMetadata.entityName} por Nombre o Email...`}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <CButton color="secondary" variant="outline" title="Buscar">
                                        <CIcon icon={cilSearch} />
                                    </CButton>
                                    <CButton 
                                        color="secondary" 
                                        variant="outline" 
                                        // Aquí iría la función para abrir el Modal/Drawer de AdvancedFilters
                                        title="Filtros Avanzados"
                                    >
                                        <CIcon icon={cilFilter} className="me-1" />
                                        {/* UX: Badge indicador de filtros activos */}
                                        {activeFilterCount > 0 && (
                                            <CBadge color="danger" shape="rounded-pill" className="ms-1">{activeFilterCount}</CBadge>
                                        )}
                                    </CButton>
                                </CInputGroup>
                            </CCol>

                            {/* BOTÓN NUEVO */}
                            <CCol xs={12} lg={3} className="text-md-end mt-2 mt-lg-0 d-grid d-lg-block">
                                <CButton
                                    color="primary"
                                    className="shadow-sm"
                                    onClick={handleClickNew}
                                >
                                    <CIcon icon={cilPlus} className="me-1" />
                                    Nuevo {studentMetadata.entityName}
                                </CButton>
                            </CCol>
                        </CRow>
                    </CCardHeader>
                    {/* FIN: ENCABEZADO */}

                    {/* CUERPO DE LA TABLA (UX: Manejo de Carga) */}
                    <CCardBody className="p-0">
                        {isLoading ? (
                            // UX: Spinner centrado mientras se cargan los datos
                            <div className="d-flex justify-content-center align-items-center py-5">
                                <CSpinner color="primary" />
                                <span className="ms-2 text-primary">Cargando datos de {studentMetadata.title}...</span>
                            </div>
                        ) : (
                            // La tabla real
                            <GenericTable 
                                table={table} 
                                isLoading={isLoading} 
                                // Callbacks para acciones que se pasan a las filas de la tabla
                                onEditClick={(item) => setEditModalVisible(true, item)} 
                                onDeleteClick={(item) => setDeleteModalVisible(true, item)} 
                            />
                        )}
                    </CCardBody>

                    {/* PIE DE PÁGINA CON PAGINACIÓN MEJORADA (UX: Conteo y Sticky) */}
                    <CCardFooter
                        className="bg-white border-top px-3 py-2"
                        style={{ position: 'sticky', bottom: 0, zIndex: 1 }}
                    >
                        <CRow className="align-items-center">
                            
                            {/* UX: Conteo Total y de Página Actual */}
                            <CCol xs={12} sm={6}>
                                <div className="small text-body-secondary">
                                    Mostrando {currentPageCount} de {totalCount} registros.
                                </div>
                            </CCol>
                            
                            {/* Paginación */}
                            <CCol xs={12} sm={6} className="d-flex justify-content-end">
                                <TablePagination table={table} />
                            </CCol>
                        </CRow>
                    </CCardFooter>
                    {/* FIN: PIE DE PÁGINA */}

                </CCard>

                {/* MODALES Reutilizables */}
                <FormModal
                    visible={editModalVisible}
                    onClose={() => setEditModalVisible(false)}
                    title={itemToEdit ? `Editar ${studentMetadata.entityName}` : `Nuevo ${studentMetadata.entityName}`}
                    initialData={itemToEdit || {}}
                    onSave={handleSave}
                    fields={studentFormFields}
                />

                <ConfirmationModal
                    visible={deleteModalVisible}
                    onClose={() => setDeleteModalVisible(false)}
                    onConfirm={handleDelete}
                    message={`¿Está seguro que desea eliminar a este ${studentMetadata.entityName}? Esta acción es irreversible.`}
                />
            </CContainer>
        </div>
    );
}