const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5173;

app.use(cors());
app.use(express.json());

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`\n📨 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log(`Headers:`, req.headers);
  if (req.body) {
    console.log(`Body:`, req.body);
  }
  next();
});

// Rota de teste direto
app.get('/test-connection', async (req, res) => {
  console.log('🧪 Testando conexão direta...');
  
  try {
    const response = await axios.post('https://integralci-oculum.jhujt5.easypanel.host/webhook/chat', {
      message: "teste conexao",
      sessionId: "test123"
    });
    
    console.log('✅ Sucesso!');
    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error('❌ Erro:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Proxy manual (sem http-proxy-middleware)
app.post('/webhook/chat', async (req, res) => {
  console.log('\n🔄 Iniciando proxy manual...');
  
  try {
    console.log('📤 Enviando para n8n:', req.body);
    
    const response = await axios.post('https://integralci-oculum.jhujt5.easypanel.host/webhook/chat', 
      req.body,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    console.log('📥 Resposta do n8n:', response.data);
    console.log('✅ Proxy manual funcionou!');
    
    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Erro no proxy manual:', {
      message: error.message,
      code: error.code,
      status: error.response?.status
    });
    
    res.status(500).json({ 
      error: 'Proxy Error',
      message: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('🧪 Teste direto: GET /test-connection');
  console.log('🔄 Proxy manual: POST /webhook/chat');
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('💥 Erro não capturado:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Promise rejeitada:', reason);
});
