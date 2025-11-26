import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  getPacientes,
  getMedicos,
  getProductos,
  getLotes,
  getUsuarios,
  getLaboratorios,
  crearReceta,
} from './api/apiClient.js';

// Versión completamente en JavaScript puro (React JS)
// Sin TypeScript, sin componentes shadcn, solo HTML + Tailwind

export default function FormularioRecetaMedica() {
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [laboratorios, setLaboratorios] = useState([]);

  const [form, setForm] = useState({
    pacienteId: "",
    medicoId: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: "",
    productoId: "",
    loteId: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [p, m, pr, l, u, la] = await Promise.all([
          getPacientes(),
          getMedicos(),
          getProductos(),
          getLotes(),
          getUsuarios(),
          getLaboratorios(),
        ]);
        
        setPacientes(p || []);
        setMedicos(m || []);
        setProductos(pr || []);
        setLotes(l || []);
        setUsuarios(u || []);
        setLaboratorios(la || []);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construir payload adaptado al backend con la estructura completa requerida
    const getProductId = (index, fallback) => {
      if (form.productoId) return Number(form.productoId);
      if (productos && productos.length > index) return productos[index].idProducto;
      if (productos && productos.length > 0) return productos[0].idProducto;
      return fallback;
    };

    const payload = {
      idPaciente: Number(form.pacienteId) || 1,
      idMedico: Number(form.medicoId) || 1,
      codigoReceta: `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
      diagnosticoPrincipal: form.diagnostico || 'Hipertensión arterial esencial (I10) con cefalea tensional ocasional',
      instruccionesGenerales: form.tratamiento || 'Tomar los medicamentos según indicación. Control de presión arterial en 30 días. Evitar sal y realizar actividad física moderada.',
      estado: 'Activa',
      validada: true,
      detalles: [
        {
          idProducto: getProductId(0, 3),
          dosis: '50 mg',
          frecuencia: '1 tableta cada 24 horas',
          viaAdministracion: 'Oral',
          duracionTratamiento: '30 días',
          cantidadPrescrita: 30,
          posologia: 'Tomar por la mañana con el desayuno',
          observaciones: 'Losartán potásico - Control de hipertensión'
        },
        {
          idProducto: getProductId(1, 1),
          dosis: '500 mg',
          frecuencia: '1 tableta cada 8 horas',
          viaAdministracion: 'Oral',
          duracionTratamiento: '5 días',
          cantidadPrescrita: 15,
          posologia: 'Solo en caso de cefalea intensa',
          observaciones: 'Paracetamol - Dolor de cabeza'
        }
      ]
    };

    try {
      const result = await crearReceta(payload);

      console.log(result);
      
      if (!result) throw new Error('Respuesta vacía');
      alert('Receta creada correctamente');
      // reset simple fields
      setForm({
        pacienteId: '',
        medicoId: '',
        diagnostico: '',
        tratamiento: '',
        observaciones: '',
        productoId: '',
        loteId: '',
      });
    } catch (err) {
      console.error('Error creando receta:', err);
      alert('Error creando receta');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto mt-10">
      <div className="shadow-xl rounded-2xl p-6 bg-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Formulación de Recetas Médicas</h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Paciente */}
          <div>
            <label className="font-semibold">Paciente</label>
            <select
              name="pacienteId"
              value={form.pacienteId}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            >
              <option value="">Seleccione un paciente</option>
              {pacientes.map((p) => {
                const usuario = usuarios.find((u) => u.idUsuario === p.idUsuario) || {};
                const nombre = usuario.primerNombre || usuario.nombre || `Paciente ${p.idPaciente}`;
                const apellido = usuario.primerApellido || usuario.apellido || '';
                return (
                  <option key={p.idPaciente} value={p.idPaciente}>
                    {nombre} {apellido}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Médico */}
          <div>
            <label className="font-semibold">Médico</label>
            <select
              name="medicoId"
              value={form.medicoId}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            >
              <option value="">Seleccione un médico</option>
              {medicos.map((m) => {
                const usuario = usuarios.find((u) => u.idUsuario === m.idUsuario) || {};
                const nombre = usuario.primerNombre || usuario.nombre || `Medico ${m.idMedico}`;
                const apellido = usuario.primerApellido || usuario.apellido || '';
                const especialidad = m.especialidadPrincipal || m.especialidad || '';
                return (
                  <option key={m.idMedico} value={m.idMedico}>
                    Dr. {nombre} {apellido} — {especialidad}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="font-semibold">Diagnóstico</label>
            <textarea
              name="diagnostico"
              value={form.diagnostico}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Ingrese el diagnóstico..."
              required
            />
          </div>

          {/* Tratamiento */}
          <div>
            <label className="font-semibold">Tratamiento</label>
            <textarea
              name="tratamiento"
              value={form.tratamiento}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Indique el tratamiento o medicamentos..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* Producto */}
            <div>
              <label className="font-semibold">Producto</label>
              <select
                name="productoId"
                value={form.productoId}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
                required
              >
                <option value="">Seleccione un producto</option>
                {productos.map((pr) => (
                  <option key={pr.idProducto} value={pr.idProducto}>
                    {pr.nombreComercial || pr.nombreGenerico || `Producto ${pr.idProducto}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Lote */}
            <div>
              <label className="font-semibold">Lote</label>
              <select
                name="loteId"
                value={form.loteId}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 mt-1"
                required
              >
                <option value="">Seleccione un lote</option>
                {lotes.map((lo) => (
                  <option key={lo.idLote} value={lo.idLote}>
                    {lo.numeroLote || lo.idLote}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Observaciones */}
          <div>
            <label className="font-semibold">Observaciones</label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              placeholder="Notas adicionales..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-lg mt-4"
          >
            Guardar Receta
          </button>
          {/* Producto y Lote en grid de dos columnas */}

        </form>
      </div>
    </motion.div>
  );
}