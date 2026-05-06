import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const MODEL = 'llama3-70b-8192'

export async function parseDietWithAI(rawDiet: string): Promise<{
  protocolo: any[]
  lista_compras: any[]
  kcal: number
  proteina: number
  carboidratos: number
  gorduras: number
}> {
  const prompt = `Você é um especialista em nutrição. O personal trainer colou o texto de uma dieta abaixo. 
Analise e retorne APENAS um JSON válido (sem markdown, sem texto extra) com esta estrutura exata:

{
  "protocolo": [
    {
      "horario": "07:00",
      "nome": "Café da manhã",
      "alimentos": [
        { "item": "Ovos mexidos", "quantidade": "3 unidades", "kcal": 210 }
      ],
      "kcal_refeicao": 350
    }
  ],
  "lista_compras": [
    { "categoria": "Proteínas", "item": "Ovos", "quantidade": "30 unidades" },
    { "categoria": "Carboidratos", "item": "Pão integral", "quantidade": "1 pacote" }
  ],
  "kcal": 2200,
  "proteina": 180,
  "carboidratos": 220,
  "gorduras": 65
}

DIETA PARA ANALISAR:
${rawDiet}

Retorne APENAS o JSON, sem qualquer outro texto.`

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  })

  const raw = response.choices[0].message.content || '{}'
  try {
    return JSON.parse(raw)
  } catch {
    // tenta extrair JSON se tiver texto extra
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('IA não retornou JSON válido')
  }
}

export async function chatWithNutri(messages: { role: string; content: string }[], dietContext?: string) {
  const systemPrompt = `Você é o NutriBot, assistente especializado em nutrição da Team Spancerski.
Foco exclusivo: nutrição, dieta, alimentos, macronutrientes, hidratação, suplementação básica.
NÃO fale sobre treinos, exercícios ou qualquer outro tema.
${dietContext ? `Contexto da dieta do cliente: ${dietContext}` : ''}
Responda em português do Brasil, de forma clara, motivadora e profissional.
Seja conciso (máx 200 palavras por resposta).`

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))
    ],
    temperature: 0.7,
    max_tokens: 500,
  })

  return response.choices[0].message.content || 'Erro ao processar resposta.'
}

export async function getMotivatinalQuote() {
  const response = await groq.chat.completions.create({
    model: 'llama3-8b-8192',
    messages: [{
      role: 'user',
      content: 'Me dê UMA frase motivacional sobre nutrição, disciplina alimentar ou transformação corporal. Formato: {"frase": "...", "autor": "..."}. Apenas JSON, sem texto extra. Frase em português.'
    }],
    temperature: 0.9,
    max_tokens: 150,
  })

  try {
    const raw = response.choices[0].message.content || '{}'
    const match = raw.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : { frase: 'A consistência é o segredo da transformação.', autor: 'Team Spancerski' }
  } catch {
    return { frase: 'Cada refeição certa é um passo em direção ao seu objetivo.', autor: 'Team Spancerski' }
  }
}
