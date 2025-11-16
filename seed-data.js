// seed-data.js
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.pqcxsbtuittbfchembsn:PostgresDB_2024_Secure@aws-1-us-east-2.pooler.supabase.com:5432/postgres"
});

async function seed() {
  try {
    await client.connect();
    console.log('✅ Conectado a Supabase para insertar datos...');

    // 1. Insertar roles básicos
    console.log('📋 Insertando roles...');
    await client.query(`
      INSERT INTO roles (nombre_rol, descripcion) VALUES 
      ('admin', 'Administrador del sistema'),
      ('medico', 'Médico prescriptor'),
      ('paciente', 'Paciente del sistema'),
      ('farmaceutico', 'Personal de farmacia')
      ON CONFLICT (nombre_rol) DO NOTHING;
    `);

    // 2. Insertar permisos básicos
    console.log('🔐 Insertando permisos...');
    await client.query(`
      INSERT INTO permisos (nombre_permiso, descripcion) VALUES 
      ('crear_receta', 'Puede crear recetas médicas'),
      ('dispensar_medicamento', 'Puede dispensar medicamentos'),
      ('gestionar_usuarios', 'Puede gestionar usuarios del sistema'),
      ('ver_reportes', 'Puede ver reportes del sistema')
      ON CONFLICT (nombre_permiso) DO NOTHING;
    `);

    // 3. Insertar laboratorios de ejemplo
    console.log('🏭 Insertando laboratorios...');
    await client.query(`
      INSERT INTO laboratorios (nombre_laboratorio, direccion, telefono, email) VALUES 
      ('Pfizer', 'Av. Principal 123', '555-0101', 'contacto@pfizer.com'),
      ('Bayer', 'Calle Secundaria 456', '555-0102', 'info@bayer.com'),
      ('Roche', 'Plaza Central 789', '555-0103', 'ventas@roche.com')
      ON CONFLICT (nombre_laboratorio) DO NOTHING;
    `);

    console.log('✅ Datos iniciales insertados correctamente!');
    await client.end();
    
  } catch (error) {
    console.log('❌ Error insertando datos:', error.message);
  }
}

seed();