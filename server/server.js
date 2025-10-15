// unibrik-backend/server.js

const express = require("express");
const cors = require("cors");
const db = require("./database.js");
const bcrypt = require("bcrypt"); // 1. Importe o bcrypt
const products = require("./products.js");
const { nanoid } = require('nanoid'); // Garanta que o nanoid está importado
const os = require('os');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


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
            address_number, address_complement, address_district, address_city, address_uf
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
        address_complement, address_district, address_city, address_uf
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    // 3. Adicione os novos parâmetros na ordem correta
    const params = [
        publicId, name, email, hashedPassword, google_sub, picture,
        birth_date, phone, address_cep, address_street, address_number,
        address_complement, address_district, address_city, address_uf
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

// 5. ROTA PARA BUSCAR DADOS DO USUÁRIO POR ID
app.get("/api/auth/user/:id", (req, res) => {
    const userId = req.params.id;
    
    const sql = "SELECT * FROM users WHERE id = ?";
    db.get(sql, [userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }
        
        // Remove a senha do objeto antes de enviar
        const { password, ...userToSend } = user;
        res.status(200).json(userToSend);
    });
});

// 6. ROTA PARA ATUALIZAR DADOS DO USUÁRIO
app.put("/api/auth/user/:id", async (req, res) => {
    const userId = req.params.id;
    const {
        name, password, birth_date, phone,
        address_cep, address_street, address_number,
        address_complement, address_district, address_city, address_uf
    } = req.body;

    // Verifica se o usuário existe
    db.get("SELECT * FROM users WHERE id = ?", [userId], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Prepara os campos para atualização
        let updateFields = [];
        let params = [];

        if (name) {
            updateFields.push("name = ?");
            params.push(name);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push("password = ?");
            params.push(hashedPassword);
        }
        if (birth_date !== undefined) {
            updateFields.push("birth_date = ?");
            params.push(birth_date);
        }
        if (phone !== undefined) {
            updateFields.push("phone = ?");
            params.push(phone);
        }
        if (address_cep !== undefined) {
            updateFields.push("address_cep = ?");
            params.push(address_cep);
        }
        if (address_street !== undefined) {
            updateFields.push("address_street = ?");
            params.push(address_street);
        }
        if (address_number !== undefined) {
            updateFields.push("address_number = ?");
            params.push(address_number);
        }
        if (address_complement !== undefined) {
            updateFields.push("address_complement = ?");
            params.push(address_complement);
        }
        if (address_district !== undefined) {
            updateFields.push("address_district = ?");
            params.push(address_district);
        }
        if (address_city !== undefined) {
            updateFields.push("address_city = ?");
            params.push(address_city);
        }
        if (address_uf !== undefined) {
            updateFields.push("address_uf = ?");
            params.push(address_uf);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: "Nenhum campo para atualizar." });
        }

        params.push(userId);
        const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;

        db.run(sql, params, function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Retorna o usuário atualizado
            db.get("SELECT * FROM users WHERE id = ?", [userId], (err, updatedUser) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                const { password, ...userToSend } = updatedUser;
                res.status(200).json({ message: "Dados atualizados com sucesso.", user: userToSend });
            });
        });
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

// Free products
app.get('/api/products/free', (req, res) => {
    const limit = parseInt(req.query.limit || '12', 10);
    products.getFreeProducts(limit, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const base = `${req.protocol}://${req.get('host')}`;
        (rows || []).forEach(r => { r.images = (r.images || []).map(p => `${base}${p}`); });
        res.json({ results: rows });
    });
});

// Recent products (most recent additions)
app.get('/api/products/recent', (req, res) => {
    const limit = parseInt(req.query.limit || '12', 10);
    // reuse searchProducts with empty query -> returns recent items
    products.searchProducts('', limit, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const base = `${req.protocol}://${req.get('host')}`;
        (rows || []).forEach(r => { r.images = (r.images || []).map(p => `${base}${p}`); });
        res.json({ results: rows });
    });
});

// Buscar produto por id
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;
    products.getProductById(id, (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Product not found' });
        // prefix images
        if (row.images && row.images.length) {
            row.images = row.images.map(p => `${req.protocol}://${req.get('host')}${p}`);
        }
        res.json({ product: row });
    });
});

// Pesquisa simples
app.get('/api/products', (req, res) => {
    const q = req.query.q || '';
    products.searchProducts(q, 50, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const base = `${req.protocol}://${req.get('host')}`;
        (rows || []).forEach(r => { r.images = (r.images || []).map(p => `${base}${p}`); });
        res.json({ results: rows });
    });
});

// Produtos de um vendedor (meus anúncios)
app.get('/api/my-products', (req, res) => {
    const seller_id = req.query.seller_id;
    if (!seller_id) return res.status(400).json({ error: 'seller_id is required' });
    products.getProductsBySeller(seller_id, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const base = `${req.protocol}://${req.get('host')}`;
        (rows || []).forEach(r => { r.images = (r.images || []).map(p => `${base}${p}`); });
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
        const base = `${req.protocol}://${req.get('host')}`;
        (rows || []).forEach(r => { r.images = (r.images || []).map(p => `${base}${p}`); });
        res.json({ results: rows });
    });
});

// Serve images folder statically
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'ads');
fs.mkdirSync(imagesDir, { recursive: true });
app.use('/images/ads', express.static(imagesDir));

// Multer setup: store files under public/images/ads/<productId>/
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const productId = req.params.id;
        const dest = path.join(imagesDir, String(productId));
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // include timestamp to avoid collisions
        const name = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, name);
    }
});
const upload = multer({ storage });

// Upload image(s) for a product
app.post('/api/products/:id/images', upload.array('images', 8), (req, res) => {
    const productId = req.params.id;
    const relPaths = (req.files || []).map(f => `/images/ads/${productId}/${f.filename}`);
    // store in DB for convenience (store relative paths)
    products.addImages(productId, relPaths, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        const abs = relPaths.map(p => `${req.protocol}://${req.get('host')}${p}`);
        res.json({ images: abs });
    });
});

// List images for a product
app.get('/api/products/:id/images', (req, res) => {
    const productId = req.params.id;
    products.getImages(productId, (err, images) => {
        if (err) return res.status(500).json({ error: err.message });
        const abs = (images || []).map(p => `${req.protocol}://${req.get('host')}${p}`);
        res.json({ images: abs });
    });
});

// Delete an image (by filename)
app.delete('/api/products/:id/images', (req, res) => {
    const productId = req.params.id;
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'filename is required' });
    const filepath = path.join(imagesDir, String(productId), path.basename(filename));
    fs.unlink(filepath, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        products.removeImage(productId, `/images/ads/${productId}/${path.basename(filename)}`, (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ deleted: true });
        });
    });
});

// Fallback JSON 404 handler (avoid Express default HTML responses)
app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});
