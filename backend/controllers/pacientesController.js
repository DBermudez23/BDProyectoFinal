import { schema } from "../db/schema";

//API para obtener todos los laboratorios 
const obtenerLab = async (req, res) => {
    try {

        const laboratorios = await ModeloLaboratorio.find({});
        res.status(200).json({ success: true, laboratorios });

    } catch (error) {

        console.log(error);
        res.status(500).json({ success: false, message: error.message });

    }
}