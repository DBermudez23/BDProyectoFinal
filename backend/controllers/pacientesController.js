import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Este formulario usa un hook personalizado llamado useInfo
// que debe exponer: getPacientes(), getMedicos()
// No implementamos el hook, solo lo usamos.

export default function FormularioRecetaMedica() {
  const { getPacientes, getMedicos } = useInfo();

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
    // Aquí haces el POST hacia tu endpoint para crear receta
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto mt-10">
      <Card className="shadow-xl rounded-2xl p-4">
        <CardContent>
          <h1 className="text-3xl font-bold mb-6 text-center">Formulación de Recetas Médicas</h1>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Seleccionar Paciente */}
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

            {/* Seleccionar Médico */}
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
              <Textarea
                name="diagnostico"
                value={form.diagnostico}
                onChange={handleChange}
                className="mt-1"
                placeholder="Ingrese el diagnóstico..."
                required
              />
            </div>

            {/* Tratamiento */}
            <div>
              <label className="font-semibold">Tratamiento</label>
              <Textarea
                name="tratamiento"
                value={form.tratamiento}
                onChange={handleChange}
                className="mt-1"
                placeholder="Indique el tratamiento o medicamentos..."
                required
              />
            </div>

            {/* Observaciones */}
            <div>
              <label className="font-semibold">Observaciones</label>
              <Textarea
                name="observaciones"
                value={form.observaciones}
                onChange={handleChange}
                className="mt-1"
                placeholder="Notas adicionales..."
              />
            </div>

            <Button type="submit" className="w-full py-3 text-lg rounded-xl">
              Guardar Receta
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Recuerda: este archivo depende de un hook personalizado llamado useInfo
// El cual debe proveer getPacientes() y getMedicos()