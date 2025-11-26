import { schema } from '../db/schema/index.js';
import { eq, desc, like, and, or } from "drizzle-orm";
import { getDB } from "../db/connection.js"; 

const db = getDB();

const { laboratorios } = schema;

// API para obtener todos los laboratorios
const obtenerLaboratorios = async (req, res) => {
    try {

        const laboratiosData = await db
            .select({
                idLaboratorio: laboratorios.idLaboratorio,
                nombreLaboratorio: laboratorios.nombreLaboratorio,
                direccion: laboratorios.direccion,
                telefono: laboratorios.telefono,
                email: laboratorios.email,
                activo: laboratorios.activo
            })
            .from(laboratorios);

        res.status(200).json({
            success: true,
            data: laboratiosData,
            total: laboratiosData.length
        });

    } catch (error) {
        console.error("Error obteniendo laboratorios:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener laboratorios"
        });
    }
};

// Obtener información del laboratorio especifico por ID
const obtenerLaboratoriosPorId = async (req, res) => {
    try {

        const { id } = req.body;

        const laboratorioData = await db
            .select({
                idLaboratorio: laboratorios.idLaboratorio,
                nombreLaboratorio: laboratorios.nombreLaboratorio,
                direccion: laboratorios.direccion,
                telefono: laboratorios.telefono,
                email: laboratorios.email,
                activo: laboratorios.activo
            })
            .from(laboratorios)
            .where(eq(laboratorios.idLaboratorio, parseInt(id)))
            .limit(1);

        if (laboratorioData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Laboratorio no encontrado"
            })
        };

        res.status(200).json({
            success: true,
            data: laboratorioData[0]
        });

    } catch (error) {
        console.error("Error obteniendo información del laboratorio:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al obtener la información del laboratorio"
        });
    }
};

const crearLaboratorio = async (req, res) => {
    try {
        const {
            nombreLaboratorio,
            direccion,
            telefono,
            email
        } = req.body;

        if (!nombreLaboratorio || !direccion || !telefono || !email) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son obligatorios"
            });
        }

        const laboratorioExiste = await db
            .select()
            .from(laboratorios)
            .where(eq(laboratorios.nombreLaboratorio, nombreLaboratorio))
            .limit(1);

        if (laboratorioExiste.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Laboratorio ya existe"
            });
        }

        const nuevoLaboratorio = await db.transaction(async (tx) => {
            // 1. Crear el laboratorio
            const [laboratorioInsertado] = await tx
                .insert(laboratorios)
                .values({
                    nombreLaboratorio,
                    direccion,
                    telefono,
                    email
                })
                .returning();

            return laboratorioInsertado;
        });

        return res.status(201).json({
            success: true,
            message: "Laboratorio creado exitosamente",
            data: nuevoLaboratorio
        });

    } catch (error) {
        console.error("Error al crear laboratorio:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear laboratorio"
        });
    }
};

const eliminarLaboratorio = async (req,res) => {
    try {
        const { id } = req.params;

        const laboratorioExiste = await db
            .select({
                idLaboratorio: laboratorios.idLaboratorio,
            })
            .from(laboratorios)
            .where(eq(laboratorios.idLaboratorio, parseInt(id)))
            .limit(1);

        if (laboratorioExiste.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Laboratorio no existe"
            });
        }

        // Eliminación lógica - desactivar laboratorio
        await db.update(laboratorios)
            .set({
                activo: false
            })
            .where(eq(laboratorios.idLaboratorio, laboratorioExiste[0].idLaboratorio));

        res.status(200).json({
            success: false,
            message: "Error interno del servidor al eliminar laboratorio"
        });
        
    } catch (error) {
        console.error("Error al crear laboratorio:", error);
        res.status(500).json({
            success: false,
            message: "Error interno del servidor al crear laboratorio"
        });
    }
}

export {
    obtenerLaboratorios,
    obtenerLaboratoriosPorId,
    crearLaboratorio,
    eliminarLaboratorio
};