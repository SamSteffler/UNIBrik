// unibrik-backend/server.js

const express = require("express");
const cors = require("cors");
const db = require("./database.js");
const bcrypt = require("bcrypt"); // 1. Importe o bcrypt
const products = require("./products.js");
const { nanoid } = require('nanoid'); // Garanta que o nanoid está importado
const os = require('os');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Simple request logger to help debug incoming API calls
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Rota de Teste
app.get("/", (req, res) => {
    res.json({ message: "Servidor UNI Brik está no ar!" });
});

// ROTA DE REGISTRO (MODIFICADA)
app.post("/api/auth/register", async (req, res) => {
    const { 
            name, email, password, google_sub, picture,
            birth_date, phone, address_cep, address_street, 
            address_number, address_district, address_city, address_uf
        } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Nome e email são obrigatórios." });
    }
    if (!google_sub && !password) {
        return res.status(400).json({ error: "Senha é obrigatória para cadastro padrão." });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const publicId = nanoid(16);  // 2. Gere um novo ID público único

    // 3. Adicione o public_id na query de inserção
    const sql = `INSERT INTO users (
        public_id, name, email, password, google_sub, picture,
        birth_date, phone, address_cep, address_street, address_number,
        address_district, address_city, address_uf
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // 3. Adicione os novos parâmetros na ordem correta
    const params = [
        publicId, name, email, hashedPassword, google_sub, picture,
        birth_date, phone, address_cep, address_street, address_number,
        address_district, address_city, address_uf
    ];
    
    db.run(sql, params, function (err) {
        if (err) {
            return res.status(400).json({ error: "Este e-mail já está em uso." });
        }
        
        db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, user) => {
            if (err) {
                return res.status(201).json({ id: this.lastID });
            }
            const { password, ...userToSend } = user;
            res.status(201).json({ user: userToSend });
        });
    });
});

// 3. ROTA DE LOGIN COM EMAIL/SENHA (NOVA)
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Se não encontrar o usuário ou se ele não tiver senha (só usa Google)
        if (!user || !user.password) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        // Compara a senha enviada com o hash salvo no banco
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // Senha correta!
            // Remove a senha do objeto antes de enviar de volta
            const { password, ...userToSend } = user;
            res.status(200).json({ message: "Login bem-sucedido.", user: userToSend });
        } else {
            // Senha incorreta
            res.status(401).json({ error: "Credenciais inválidas." });
        }
    });
});


// 4. ROTA DE LOGIN COM GOOGLE (MODIFICADA)
app.post("/api/auth/google", (req, res) => {
    const { sub, email, name, picture } = req.body;

    const sql = "SELECT * FROM users WHERE google_sub = ? OR email = ?";
    db.get(sql, [sub, email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (user) {
            // Usuário existe, login bem-sucedido
            const { password, ...userToSend } = user;
            return res.status(200).json({ message: "Login bem-sucedido.", user: userToSend });
        } else {
            // Usuário não encontrado, informa o frontend para redirecionar ao cadastro
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
    });
}); 

// Helper para obter IP local (primeiro IPv4 não-interno)
function getLocalIP() {
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
        for (const iface of ifaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Inicia o servidor e vincula a todas as interfaces
app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIP();
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse localmente: http://localhost:${PORT}`);
    console.log(`Acesse pela rede: http://${ip}:${PORT}`);
});

// -------------------------
// Rotas de produtos
// -------------------------

// Criar produto
app.post('/api/products', (req, res) => {
    const product = req.body;
    if (!product.title) return res.status(400).json({ error: 'Title is required' });
    products.createProduct(product, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ product: row });
    });
});

// Buscar produto por id
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    products.getProductById(id, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Product not found' });
        res.json({ product: row });
    });
});

// Pesquisa simples
app.get('/api/products', (req, res) => {
    const q = req.query.q || '';
    products.searchProducts(q, 50, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ results: rows });
    });
});

// Produtos de um vendedor (meus anúncios)
app.get('/api/my-products', (req, res) => {
    const seller_id = req.query.seller_id;
    if (!seller_id) return res.status(400).json({ error: 'seller_id is required' });
    products.getProductsBySeller(seller_id, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ results: rows });
    });
});

// Atualizar produto
app.put('/api/products/:id', (req, res) => {
    const id = req.params.id;
    const payload = req.body;
    products.updateProduct(id, payload, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ product: row });
    });
});

// Deletar produto
app.delete('/api/products/:id', (req, res) => {
    const id = req.params.id;
    console.log(`DELETE called for id=${id}`);
    products.deleteProduct(id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result && result.deleted) return res.json({ deleted: true });
        res.status(404).json({ error: 'Product not found' });
    });
});

// Favoritar um produto (idempotent)
app.post('/api/products/:id/favorite', (req, res) => {
    const productId = req.params.id;
    const userId = req.body.user_id || req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id is required' });
    products.createFavorite(userId, productId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ favorited: !!ok });
    });
});

// Remover favorito
app.delete('/api/products/:id/favorite', (req, res) => {
    const productId = req.params.id;
    const userId = req.body.user_id || req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id is required' });
    products.deleteFavorite(userId, productId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: !!(result && result.deleted) });
    });
});

// List favorites for a user
app.get('/api/users/:id/favorites', (req, res) => {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    products.getFavoritesByUser(userId, limit, offset, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ results: rows });
    });
});

// Fallback JSON 404 handler (avoid Express default HTML responses)
app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});