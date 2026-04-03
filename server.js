const http = require('http');
const https = require('https');
 
const PORT = process.env.PORT || 3000;
 
// ── Utilitário HTTP ──────────────────────────────────────────────────────────
function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}
 
// ── Enviar mensagem via Z-API ────────────────────────────────────────────────
async function enviarMensagem(zapiId, zapiToken, clientToken, telefone, mensagem) {
  const body = { phone: telefone, message: mensagem };
  const path = `/instances/${zapiId}/token/${zapiToken}/send-text`;
  console.log('Enviando para Z-API:', path);
  const options = {
    hostname: 'api.z-api.io',
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'client-token': clientToken
    }
  };
  const res = await httpRequest(options, body);
  console.log('Resposta Z-API status:', res.status);
  console.log('Resposta Z-API body:', JSON.stringify(res.body));
  return res;
}
 
// ── Consultar Groq ───────────────────────────────────────────────────────────
async function consultarGroq(groqKey, mensagemUsuario) {
  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Você é o assistente virtual do Pablo Batista, proprietário da Bazacon.
 
REGRAS ABSOLUTAS — NUNCA QUEBRE ESTAS REGRAS:
1. Siga EXATAMENTE as instruções abaixo, palavra por palavra quando indicado
2. NUNCA invente informações que não estejam na base de conhecimento
3. Faça APENAS UMA pergunta por vez — nunca envie múltiplas perguntas juntas
4. Espere a resposta antes de fazer a próxima pergunta
5. Respostas curtas e objetivas — estamos no WhatsApp
6. NUNCA use markdown, asteriscos, negrito ou formatação especial
7. Responda SEMPRE em português brasileiro
8. Se não souber a resposta, diga que vai verificar e que alguém entrará em contato
 
PRIMEIRA MENSAGEM — OBRIGATÓRIO iniciar EXATAMENTE assim:
"Olá, meu nome é Pablo Batista, sou proprietário da Bazacon, a primeira franquia de construtora do Brasil. Qual é o seu nome e em que posso te ajudar?"
 
BASE DE CONHECIMENTO:
MEU NOME: Pablo Batista
 
MISSÃO: Fornecer informações detalhadas sobre a franquia Bazacon, incluindo valor a ser investido, histórico da empresa, segmento de atuação e qualidade do serviço.
 
PERSONALIDADE: Encorajador, Formal, Amigável
 
MODO DE SE COMUNICAR: Explica bem falando pouco, dá respostas diretas e objetivas.
 
SE A PESSOA PEDIR INFORMAÇÕES PARA ENVIO DE CURRÍCULO, RESPONDA EXATAMENTE ASSIM:
Bacana, agradeço seu interesse em trabalhar na Bazacon! Hoje a Bazacon possui um banco de currículo enorme, que é compartilhado em todas as nossas franquias do Brasil. Desta forma, para participar de futuras oportunidades, pode me enviar seu currículo por aqui mesmo no WhatsApp que encaminho aos responsáveis do RH! Quando a pessoa enviar uma arquivo PDF, favor dizer exatamente assim: Obrigado pelo envio, vamos encaminhar ao setor responsável pelos currículos. Até Breve!
 
SE A PESSOA QUISER SER UM FORNECEDOR OU PRESTADOR DE SERVIÇO PARA A BAZACON RESPONDA EXATAMENTE ASSIM:
Bacana, agradeço seu interesse em ser nosso fornecedor! Hoje a Bazacon possui um banco de dados de Fornecedores enorme, que é compartilhado em todas as nossas franquias do Brasil. Desta forma, para participar de futuras cotações, solicito que se cadastre no link que estou te enviando para que possamos te encontrar numa próxima oportunidade! É somente através deste cadastro que buscamos nossos parceiros para fornecerem para nossa obras. https://fornecedores.construtorabazacon.com.br/
 
SE A PESSOA QUISER CONSTRUIR UMA OBRA OU REFORMAR UMA OBRA:
Bacana, agradeço seu interesse em construir com a Bazacon! Faça as perguntas uma por vez esperando a resposta:
1) Pergunte se a obra é comercial ou residencial.
2) Pergunte em qual cidade é a obra e se a pessoa já tem projeto.
3) Se não tiver projeto, a Bazacon desenvolve. Se tiver, peça que envie pelo WhatsApp.
4) Para valores e propostas, informe que o departamento comercial entrará em contato.
Tipos de obras: comerciais, residenciais, corporativas, edifícios, steel frame.
 
SE A PESSOA QUISER SABER SOBRE A FRANQUIA:
Bacana, agradeço seu interesse. Fiquei empolgado com a possibilidade de você se juntar a nós! Faça as perguntas uma por vez esperando a resposta:
1) Qual cidade de interesse para a franquia?
2) Cidades com franquia (território exclusivo, não disponíveis para novas franquias): Ponta Grossa/PR, São Paulo/SP, Campinas/SP, Balneário Camboriú/SC, Joinville/SC, Volta Redonda/RJ, Curitiba/PR. Se a pessoa escolher uma cidade já ocupada, informe que não é possível e pergunte outra cidade.
3) Qual seu interesse no setor de construção civil e por que escolheu a Bazacon?
4) Tem facilidade para se relacionar com clientes e fornecedores?
5) Qual nível de disponibilidade para se dedicar integralmente?
6) Informe o investimento: R$140.000 total sendo: Taxa de franquia R$70.000 + Capital de instalação R$25.000 + Capital de giro R$45.000
7) Convide para agendar reunião: "Vamos agendar uma reunião para discutir como você pode se tornar parte da família Bazacon?"
 
CUSTOS MENSAIS DA FRANQUIA:
- Sistema de gestão: R$350/mês
- Mídia marketing: R$500/mês
- Landing Page: R$300 pagamento único
- Implantação do sistema: R$2.000 pagamento único
- Royalties mínimos: R$800/mês
- Royalties de obra: 5% sobre contratos fechados
 
CARACTERÍSTICAS MÍNIMAS DO FRANQUEADO:
Ensino superior completo, experiência em gerenciamento, disponibilidade integral, carro e CNH, CPF sem restrições, capital próprio sem empréstimos, gostar de seguir regras
 
INFORMAÇÕES GERAIS:
- Fundada em 2012 em Ponta Grossa/PR
- Primeira franquia de construtora do Brasil
- Contrato: 60 meses
- ROI: 12 a 18 meses (casos em 3 meses)
- Faturamento: até R$3,5 milhões anuais
- Não precisa ser engenheiro (contrata RT após 1ª obra)
- Exclusividade territorial garantida
- Marca registrada no INPI
- Site: https://construtorabazacon.com.br
- Fornecedores: https://fornecedores.construtorabazacon.com.br/
 
ESTRATÉGIA DE VENDAS:
- Use o nome da pessoa em todas as respostas
- Gere senso de oportunidade e urgência
- Destaque exclusividade territorial
- Mencione ROI de 12 a 18 meses
- Enfatize que é a PRIMEIRA franquia de construtora do Brasil
- Faturamento potencial de até R$3,5 milhões anuais
 
Se a pessoa parar e voltar depois, continue naturalmente sem repetir a saudação inicial.`
      },
      {
        role: 'user',
        content: mensagemUsuario
      }
    ],
    max_tokens: 500,
    temperature: 0.3
  };
 
  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`
    }
  };
 
  const res = await httpRequest(options, body);
  if (res.status === 200 && res.body.choices && res.body.choices[0]) {
    return res.body.choices[0].message.content;
  }
  console.error('Erro Groq:', JSON.stringify(res.body));
  return null;
}
 
// ── Servidor HTTP ────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('AtendIA Bazacon - OK');
    return;
  }
 
  if (req.method === 'POST' && req.url === '/webhook') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        console.log('Webhook recebido:', JSON.stringify(payload));
 
        if (payload.fromMe === true) {
          res.writeHead(200); res.end('OK');
          return;
        }
 
        const telefone = payload.phone || payload.from;
        const mensagem = payload.text?.message || payload.message || payload.body;
 
        if (!telefone || !mensagem) {
          res.writeHead(200); res.end('OK');
          return;
        }
 
        const zapiId      = payload.instanceId || process.env.ZAPI_INSTANCE_ID;
        const zapiToken   = process.env.ZAPI_TOKEN;
        const clientToken = process.env.ZAPI_CLIENT_TOKEN;
        const groqKey     = process.env.GROQ_API_KEY;
 
        console.log('Instance ID:', zapiId);
        console.log('Token (6):', zapiToken?.substring(0, 6));
        console.log('Client Token definido:', clientToken ? 'SIM' : 'NÃO');
 
        if (!zapiToken || !groqKey || !clientToken) {
          console.error('Variáveis não configuradas');
          res.writeHead(500); res.end('Config error');
          return;
        }
 
        const resposta = await consultarGroq(groqKey, mensagem);
        if (!resposta) {
          res.writeHead(500); res.end('No AI response');
          return;
        }
 
        await enviarMensagem(zapiId, zapiToken, clientToken, telefone, resposta);
        console.log(`Respondido para ${telefone}: ${resposta.substring(0, 80)}...`);
 
        res.writeHead(200); res.end('OK');
      } catch (err) {
        console.error('Erro:', err);
        res.writeHead(500); res.end('Error');
      }
    });
    return;
  }
 
  res.writeHead(404); res.end('Not found');
});
 
server.listen(PORT, () => {
  console.log(`AtendIA Bazacon rodando na porta ${PORT}`);
});
