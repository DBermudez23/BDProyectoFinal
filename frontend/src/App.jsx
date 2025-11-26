import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Versión completamente en JavaScript puro (React JS)
// Sin TypeScript, sin componentes shadcn, solo HTML + Tailwind

export default function FormularioRecetaMedica() {
  //const { getPacientes, getMedicos } = useInfo();

  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);

  const [form, setForm] = useState({
    pacienteId: "",
    medicoId: "",
    diagnostico: "",
    tratamiento: "",
    observaciones: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      const p = await getPacientes();
      const m = await getMedicos();
      setPacientes(p || []);
      setMedicos(m || []);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", form);
    // Aquí harías el POST al backend
  };

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
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
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
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>
                  Dr. {m.nombre} {m.apellido} — {m.especialidad}
                </option>
              ))}
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
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    Dr. {m.nombre} {m.apellido} — {m.especialidad}
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
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    Dr. {m.nombre} {m.apellido} — {m.especialidad}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div>
            <label>Nu</label>
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