import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";

export default function FormularioReceta() {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset
  } = useForm();

  const productoSeleccionado = watch("producto");

  const [productos, setProductos] = useState([]);
  const [lotes, setLotes] = useState([]);

  // Autocomplete Paciente
  const [searchPaciente, setSearchPaciente] = useState("");
  const [pacientesEncontrados, setPacientesEncontrados] = useState([]);

  // Autocomplete Doctor
  const [searchDoctor, setSearchDoctor] = useState("");
  const [doctoresEncontrados, setDoctoresEncontrados] = useState([]);

  // 📌 Handler general reutilizable para RHF
  const handleInputChange = (name, value) => {
    setValue(name, value);
  };

  // 🔽 Cargar productos (simulado)
  useEffect(() => {
    setProductos([
      { id: 1, nombre: "Ibuprofeno 400mg" },
      { id: 2, nombre: "Paracetamol 500mg" },
    ]);
  }, []);

  // 🔁 Cargar lotes según producto
  useEffect(() => {
    if (productoSeleccionado == 1) {
      setLotes(["A001", "A002", "A003"]);
    } else if (productoSeleccionado == 2) {
      setLotes(["B010", "B011"]);
    } else {
      setLotes([]);
    }
  }, [productoSeleccionado]);

  // 🔎 Buscar paciente (debounce)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchPaciente.trim().length > 2) {
        axios.get(`/api/pacientes?search=${searchPaciente}`).then((res) => {
          setPacientesEncontrados(res.data);
        });
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchPaciente]);

  // 🔎 Buscar doctor (debounce)
  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchDoctor.trim().length > 2) {
        axios.get(`/api/doctores?search=${searchDoctor}`).then((res) => {
          setDoctoresEncontrados(res.data);
        });
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchDoctor]);

  // 📤 Enviar form
  const onSubmit = (data) => {
    const formData = {
      ...data,
      fecha: new Date().toISOString(),
    };

    console.log("📦 FORM DATA ENVIADA:", formData);

    axios
      .post("/api/recetas", formData)
      .then(() => alert("Receta generada"))
      .catch(() => alert("Error al enviar"));
  };

  // 🖨 Función imprimir
  const imprimirReceta = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-center mb-4">
          Formulario de Receta Médica
        </h1>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

          {/* 🔹 PACIENTE */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Datos del Paciente</h2>
            {/* NUEVO ➜ Tipo de sangre */}
<select
  {...register("tipo_sangre")}
  className="w-full p-3 border rounded-xl"
>
  <option value="">Tipo de sangre</option>
  <option value="A+">A+</option>
  <option value="A-">A-</option>
  <option value="B+">B+</option>
  <option value="B-">B-</option>
  <option value="AB+">AB+</option>
  <option value="AB-">AB-</option>
  <option value="O+">O+</option>
  <option value="O-">O-</option>
</select>

{/* NUEVO ➜ EPS */}
<input
  {...register("eps")}
  className="w-full p-3 border rounded-xl"
  placeholder="Entidad prestadora de salud (EPS)"
/>

            <input
              type="text"
              placeholder="Buscar paciente..."
              className="w-full p-3 border rounded-xl"
              onChange={(e) => setSearchPaciente(e.target.value)}
            />

            {pacientesEncontrados.length > 0 && (
              <div className="bg-gray-100 border rounded-xl p-3 space-y-1">
                {pacientesEncontrados.map((p) => (
                  <p
                    key={p.id}
                    className="p-2 bg-white rounded cursor-pointer hover:bg-blue-100"
                    onClick={() => {
                      handleInputChange("paciente", p.nombre);
                      handleInputChange("edad", p.edad);
                      handleInputChange("documento", p.documento);
                      setPacientesEncontrados([]);
                    }}
                  >
                    {p.nombre} - {p.documento}
                  </p>
                ))}
              </div>
            )}

            <input
              {...register("paciente")}
              className="w-full p-3 border rounded-xl"
              placeholder="Nombre del paciente"
            />

            <input
              {...register("edad")}
              type="number"
              className="w-full p-3 border rounded-xl"
              placeholder="Edad"
            />

            <input
              {...register("documento")}
              className="w-full p-3 border rounded-xl"
              placeholder="Documento"
            />
          </div>

          {/* 🔹 DOCTOR */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Doctor</h2>

            <input
              type="text"
              placeholder="Buscar doctor..."
              className="w-full p-3 border rounded-xl"
              onChange={(e) => setSearchDoctor(e.target.value)}
            />

            {doctoresEncontrados.length > 0 && (
              <div className="bg-gray-100 border rounded-xl p-3 space-y-1">
                {doctoresEncontrados.map((d) => (
                  <p
                    key={d.id}
                    className="p-2 bg-white rounded cursor-pointer hover:bg-green-100"
                    onClick={() => {
                      handleInputChange("doctor", d.nombre);
                      handleInputChange("especializacion", d.especializacion);
                      setDoctoresEncontrados([]);
                    }}
                  >
                    {d.nombre}
                  </p>
                ))}
              </div>
            )}

            <input
              {...register("doctor")}
              className="w-full p-3 border rounded-xl"
              placeholder="Nombre del doctor"
            />

            {/* NUEVO ➜ Especialización */}
            <input
              {...register("especializacion")}
              className="w-full p-3 border rounded-xl"
              placeholder="Especialización"
            />
          </div>

          {/* 🔹 PRODUCTO + LOTE */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Medicamento</h2>

            {/* SELECT PRODUCTO */}
            <Controller
              control={control}
              name="producto"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full p-3 border rounded-xl"
                >
                  <option value="">Seleccione un producto</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              )}
            />

            {/* SELECT LOTE */}
            <Controller
              control={control}
              name="lote"
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full p-3 border rounded-xl"
                  disabled={!lotes.length}
                >
                  <option value="">Seleccione un lote</option>
                  {lotes.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              )}
            />

            <input
              {...register("dosis")}
              className="w-full p-3 border rounded-xl"
              placeholder="Dosis (mg/ml)"
            />

            <input
              {...register("frecuencia")}
              className="w-full p-3 border rounded-xl"
              placeholder="Frecuencia (ej. cada 8h)"
            />

            <input
              {...register("duracion")}
              className="w-full p-3 border rounded-xl"
              placeholder="Duración del tratamiento"
            />
          </div>

          {/* 🔹 OBSERVACIONES */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Observaciones</h2>
            <textarea
              {...register("observaciones")}
              className="w-full p-3 border rounded-xl h-28"
              placeholder="Observaciones adicionales"
            ></textarea>
          </div>

          {/* BOTONES */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700"
            >
              Generar Receta
            </button>

            {/* NUEVO ➜ Botón imprimir */}
            <button
              type="button"
              onClick={imprimirReceta}
              className="w-full bg-gray-700 text-white p-3 rounded-xl font-semibold hover:bg-gray-800"
            >
              Imprimir
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
