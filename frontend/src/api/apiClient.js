// api/apiClient.js
const API_BASE_URL = 'http://localhost:3001/api';

async function parseResponse(response) {
  const text = await response.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }
  if (!response.ok) {
    const err = (json && (json.message || JSON.error || JSON)) || response.statusText;
    throw new Error(typeof err === 'string' ? err : JSON.stringify(err));
  }
  // Prefer the `data` field if present (backend wraps responses as { success, data, ... })
  if (json && Object.prototype.hasOwnProperty.call(json, 'data')) return json.data;
  return json;
}

export const getPacientes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes`);
    return await parseResponse(response) ?? [];
  } catch (error) {
    console.error('Error en getPacientes:', error);
    return [];
  }
};

export const getPacientePorId = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes/${id}`);
    if (!response.ok) throw new Error('Error al obtener paciente');
    return await parseResponse(response);
  } catch (error) {
    console.error('Error en getPacientePorId:', error);
    return null;
  }
};

export const crearPaciente = async (datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al crear paciente');
    return await response.json();
  } catch (error) {
    console.error('Error en crearPaciente:', error);
    return null;
  }
};

export const actualizarPaciente = async (id, datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al actualizar paciente');
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarPaciente:', error);
    return null;
  }
};

export const eliminarPaciente = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar paciente');
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarPaciente:', error);
    return null;
  }
};

export const buscarPacientes = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacientes/buscar/search?q=${query}`);
    if (!response.ok) throw new Error('Error al buscar pacientes');
    return await response.json();
  } catch (error) {
    console.error('Error en buscarPacientes:', error);
    return [];
  }
};

export const getMedicos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/medicos`);
    if (!response.ok) throw new Error('Error al obtener médicos');
    return await parseResponse(response) ?? [];
  } catch (error) {
    console.error('Error en getMedicos:', error);
    return [];
  }
};

export const getMedicoPorId = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medicos/${id}`);
    if (!response.ok) throw new Error('Error al obtener médico');
    return await parseResponse(response);
  } catch (error) {
    console.error('Error en getMedicoPorId:', error);
    return null;
  }
};

export const crearMedico = async (datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medicos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al crear médico');
    return await response.json();
  } catch (error) {
    console.error('Error en crearMedico:', error);
    return null;
  }
};

export const actualizarMedico = async (id, datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medicos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al actualizar médico');
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarMedico:', error);
    return null;
  }
};

export const eliminarMedico = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medicos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar médico');
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarMedico:', error);
    return null;
  }
};

export const buscarMedico = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/medicos/buscar/search?q=${query}`);
    if (!response.ok) throw new Error('Error al buscar médicos');
    return await response.json();
  } catch (error) {
    console.error('Error en buscarMedico:', error);
    return [];
  }
};

export const getLaboratorios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/laboratorios`);
    if (!response.ok) throw new Error('Error al obtener laboratorios');
    return await parseResponse(response) ?? [];
  } catch (error) {
    console.error('Error en getLaboratorios:', error);
    return [];
  }
};

export const getLaboratorioPorId = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/laboratorios/${id}`);
    if (!response.ok) throw new Error('Error al obtener laboratorio');
    return await parseResponse(response);
  } catch (error) {
    console.error('Error en getLaboratorioPorId:', error);
    return null;
  }
};

export const crearLaboratorio = async (datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/laboratorios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al crear laboratorio');
    return await response.json();
  } catch (error) {
    console.error('Error en crearLaboratorio:', error);
    return null;
  }
};

export const eliminarLaboratorio = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/laboratorios/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar laboratorio');
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarLaboratorio:', error);
    return null;
  }
};

export const getUsuarios = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`);
    if (!response.ok) throw new Error('Error al obtener usuarios');
    return await parseResponse(response) ?? [];
  } catch (error) {
    console.error('Error en getUsuarios:', error);
    return [];
  }
};

export const getUsuarioPorId = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`);
    if (!response.ok) throw new Error('Error al obtener usuario');
    return await parseResponse(response);
  } catch (error) {
    console.error('Error en getUsuarioPorId:', error);
    return null;
  }
};

export const crearUsuario = async (datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al crear usuario');
    return await response.json();
  } catch (error) {
    console.error('Error en crearUsuario:', error);
    return null;
  }
};

export const actualizarUsuario = async (id, datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al actualizar usuario');
    return await response.json();
  } catch (error) {
    console.error('Error en actualizarUsuario:', error);
    return null;
  }
};

export const eliminarUsuario = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar usuario');
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarUsuario:', error);
    return null;
  }
};

export const getLotes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/lotes`);
    if (!response.ok) throw new Error('Error al obtener lotes');
    return await parseResponse(response) ?? [];
  } catch (error) {
    console.error('Error en getLotes:', error);
    return [];
  }
};

export const getLotePorId = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lotes/${id}`);
    if (!response.ok) throw new Error('Error al obtener lote');
    return await parseResponse(response);
  } catch (error) {
    console.error('Error en getLotePorId:', error);
    return null;
  }
};

export const crearLote = async (datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al crear lote');
    return await response.json();
  } catch (error) {
    console.error('Error en crearLote:', error);
    return null;
  }
};

export const eliminarLote = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/lotes/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar lote');
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarLote:', error);
    return null;
  }
};

export const getProductos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos`);
    if (!response.ok) throw new Error('Error al obtener productos');
    return await parseResponse(response) ?? [];
  } catch (error) {
    console.error('Error en getProductos:', error);
    return [];
  }
};

export const getProductoPorId = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`);
    if (!response.ok) throw new Error('Error al obtener producto');
    return await parseResponse(response);
  } catch (error) {
    console.error('Error en getProductoPorId:', error);
    return null;
  }
};

export const crearProducto = async (datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al crear producto');
    return await response.json();
  } catch (error) {
    console.error('Error en crearProducto:', error);
    return null;
  }
};

export const eliminarProducto = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar producto');
    return await response.json();
  } catch (error) {
    console.error('Error en eliminarProducto:', error);
    return null;
  }
};

export const crearReceta = async (datos) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recetas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error('Error al crear receta: ' + text);
    }
    return await response.json();
  } catch (error) {
    console.error('Error en crearReceta:', error);
    return null;
  }
};
