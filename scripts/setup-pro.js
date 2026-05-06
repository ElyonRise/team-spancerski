// Execute APENAS UMA VEZ para criar o usuário profissional

// node scripts/setup-pro.js



const { Pool } = require('pg')

const bcrypt = require('bcryptjs')

require('dotenv').config({ path: '.env.local' })



async function main() {

  const pool = new Pool({

    connectionString: process.env.DATABASE_URL,

    ssl: { rejectUnauthorized: false }

  })



  const email = process.env.PRO_EMAIL || 'spancerski@email.com'

  const password = process.env.PRO_INITIAL_PASSWORD || 'Spancerski@2025'



  const hash = await bcrypt.hash(password, 12)



  // Criar tabelas

  await pool.query(`

    CREATE TABLE IF NOT EXISTS users (

      id SERIAL PRIMARY KEY,

      name VARCHAR(255) NOT NULL,

      email VARCHAR(255) UNIQUE NOT NULL,

      password_hash VARCHAR(255) NOT NULL,

      role VARCHAR(20) DEFAULT 'client',

      phone VARCHAR(50),

      goal VARCHAR(100),

      weight_start NUMERIC(5,2),

      height_cm INT,

      reset_token VARCHAR(255),

      reset_expires TIMESTAMPTZ,

      created_at TIMESTAMPTZ DEFAULT NOW()

    );

    CREATE TABLE IF NOT EXISTS dietas (

      id SERIAL PRIMARY KEY,

      client_id INT REFERENCES users(id) ON DELETE CASCADE,

      nome VARCHAR(255) NOT NULL,

      conteudo_raw TEXT,

      protocolo JSONB,

      kcal INT,

      proteina INT,

      carboidratos INT,

      gorduras INT,

      created_at TIMESTAMPTZ DEFAULT NOW()

    );

    CREATE TABLE IF NOT EXISTS lista_compras (

      id SERIAL PRIMARY KEY,

      client_id INT REFERENCES users(id) ON DELETE CASCADE,

      dieta_id INT REFERENCES dietas(id) ON DELETE CASCADE,

      itens JSONB NOT NULL,

      created_at TIMESTAMPTZ DEFAULT NOW()

    );

    CREATE TABLE IF NOT EXISTS registros_imc (

      id SERIAL PRIMARY KEY,

      client_id INT REFERENCES users(id) ON DELETE CASCADE,

      peso NUMERIC(5,2),

      altura INT,

      imc NUMERIC(4,2),

      categoria VARCHAR(50),

      recorded_at TIMESTAMPTZ DEFAULT NOW()

    );

    CREATE TABLE IF NOT EXISTS fotos_progresso (

      id SERIAL PRIMARY KEY,

      client_id INT REFERENCES users(id) ON DELETE CASCADE,

      url TEXT NOT NULL,

      tipo VARCHAR(20) DEFAULT 'progress',

      descricao TEXT,

      data_foto DATE,

      uploaded_by VARCHAR(20) DEFAULT 'client',

      created_at TIMESTAMPTZ DEFAULT NOW()

    );

    CREATE TABLE IF NOT EXISTS motivacao_streak (

      id SERIAL PRIMARY KEY,

      client_id INT REFERENCES users(id) ON DELETE CASCADE,

      data DATE NOT NULL,

      UNIQUE(client_id, data)

    );

  `)



  // Inserir profissional

  await pool.query(

    `INSERT INTO users (name, email, password_hash, role)

     VALUES ('Team Spancerski', $1, $2, 'pro')

     ON CONFLICT (email) DO UPDATE SET password_hash = $2`,

    [email, hash]

  )



  console.log('✅ Banco configurado com sucesso!')

  console.log(`📧 Email: ${email}`)

  console.log(`🔑 Senha: ${password}`)

  console.log('⚠️  Altere sua senha após o primeiro login!')



  await pool.end()

}



main().catch(console.error)
