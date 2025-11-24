/*
------------- server.js -------------
Servidor principal da API UniBrik
Uso: node server.js
*/


const express = require("express");
const cors = require("cors");
const db = require("./database.js");
const bcrypt = require("bcrypt");
const products = require("./products.js");
const messages = require("./messageserver.js");
const { nanoid } = require('nanoid');
const os = require('os');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// ---------------------------------------------------------
// FUNÇÕES AUXILIARES
// ---------------------------------------------------------

// Verifica se o e-mail pertence ao domínio da UFSM
function isUfsmEmail(email) {
    if (!email) return false;
    const parts = email.split('@');
    // Garante que tem algo antes e depois do @
    if (parts.length !== 2) return false;
    
    const domain = parts[1].toLowerCase();
    // Verifica se "ufsm" está presente na parte do domínio (ex: @ufsm.br, @acad.ufsm.br)
    return domain.includes('ufsm');
}

// Rota de Teste
app.get("/", (req, res) => {
    res.json({ message: "Servidor UniBrik está no ar!" });
});

// ROTA DE REGISTRO (MODIFICADA)
app.post("/api/auth/register", async (req, res) => {
    const { 
            name, email, password, google_sub, picture,
            birth_date, phone, address_cep, address_street, 
            address_number, address_complement, address_district, address_city, address_uf
        } = req.body;

    // --- NOVA VALIDAÇÃO UFSM ---
    if (!isUfsmEmail(email)) {
        return res.status(400).json({ 
            error: "Acesso restrito. Utilize um e-mail institucional da UFSM." 
        });
    }
    // ---------------------------

    if (!name || !email) {
        return res.status(400).json({ error: "Nome e email são obrigatórios." });
    }
    if (!google_sub && !password) {
        return res.status(400).json({ error: "Senha é obrigatória para cadastro padrão." });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const publicId = nanoid(16); 

    const sql = `INSERT INTO users (
        public_id, name, email, password, google_sub, picture,
        birth_date, phone, address_cep, address_street, address_number,
        address_complement, address_district, address_city, address_uf
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
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
        // Se nao encontrar o usuario ou se ele nao tiver senha (so usa Google)
        if (!user || !user.password) {
            return res.status(401).json({ error: "Credenciais inválidas." });
        }

        // Verifica se o usuario esta bloqueado
        if (user.approved === 0) {
            return res.status(403).json({ 
                error: "Conta bloqueada", 
                blocked: true,
                message: "Sua conta foi bloqueada pela administração. Entre em contato para mais informações." 
            });
        }

        // Compara a senha enviada com o hash salvo no banco
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            // Senha correta - remove a senha do objeto antes de enviar de volta
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

    // --- NOVA VALIDAÇÃO UFSM ---
    if (!isUfsmEmail(email)) {
        return res.status(403).json({ 
            error: "Login permitido apenas com e-mails da UFSM." 
        });
    }
    // ---------------------------

    const sql = "SELECT * FROM users WHERE google_sub = ? OR email = ?";
    db.get(sql, [sub, email], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (user) {
            // Verifica se o usuario esta bloqueado
            if (user.approved === 0) {
                return res.status(403).json({ 
                    error: "Conta bloqueada", 
                    blocked: true,
                    message: "Sua conta foi bloqueada pela administração. Entre em contato para mais informações." 
                });
            }
            
            // Usuario existe - login bem-sucedido
            const { password, ...userToSend } = user;
            return res.status(200).json({ message: "Login bem-sucedido.", user: userToSend });
        } else {
            // Usuario nao encontrado - informa o frontend para redirecionar ao cadastro
            return res.status(404).json({ message: "Usuário não encontrado." });
        }
    });
});

// 5. ROTA PARA BUSCAR DADOS DO USUARIO POR ID
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

// 6. ROTA PARA ATUALIZAR DADOS DO USUARIO
app.put("/api/auth/user/:id", async (req, res) => {
    const userId = req.params.id;
    const {
        name, password, birth_date, phone,
        address_cep, address_street, address_number,
        address_complement, address_district, address_city, address_uf
    } = req.body;

    // Verifica se o usuario existe
    db.get("SELECT * FROM users WHERE id = ?", [userId], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Prepara campos para atualizacao
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

            // Retorna o usuario atualizado
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

// --- ADMIN HELPERS & ROUTES ---
// Helper para verificar se o usuario e admin ou supervisor 
function isAdmin(adminId, cb) {
    if (!adminId) return cb(null, false);
    db.get('SELECT role FROM users WHERE id = ?', [adminId], (err, row) => {
        if (err || !row) return cb(err, false);
        cb(null, row.role === 'admin' || row.role === 'supervisor');
    });
}

// Aprova usuario (set approved = 1)
app.post('/api/admin/approve-user/:id', (req, res) => {
    const adminId = req.header('x-admin-id') || req.query.admin_id;
    const userId = req.params.id;
    isAdmin(adminId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!ok) return res.status(403).json({ error: 'Admin privileges required' });
        db.run('UPDATE users SET approved = 1 WHERE id = ?', [userId], function(uerr) {
            if (uerr) return res.status(500).json({ error: uerr.message });
            res.json({ approved: this.changes > 0 });
        });
    });
});

// Desaprova usuario (set approved = 0) e bloqueia todos os produtos dele
app.post('/api/admin/unapprove-user/:id', (req, res) => {
    const adminId = req.header('x-admin-id') || req.query.admin_id;
    const userId = req.params.id;
    isAdmin(adminId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!ok) return res.status(403).json({ error: 'Admin privileges required' });
        
        // Bloqueia o usuario
        db.run('UPDATE users SET approved = 0 WHERE id = ?', [userId], function(uerr) {
            if (uerr) return res.status(500).json({ error: uerr.message });
            
            // Bloqueia todos os produtos do usuario
            db.run('UPDATE products SET status = "blocked" WHERE seller_id = ?', [userId], function(perr) {
                if (perr) {
                    console.error('Error blocking user products:', perr);
                }
                
                res.json({ 
                    unapproved: this.changes > 0,
                    productsBlocked: this.changes || 0,
                    message: 'User blocked and all their products have been hidden'
                });
            });
        });
    });
});

// Deleta usuario e todos os produtos relacionados
app.delete('/api/admin/user/:id', (req, res) => {
    const adminId = req.header('x-admin-id') || req.query.admin_id;
    const userId = req.params.id;
    isAdmin(adminId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!ok) return res.status(403).json({ error: 'Admin privileges required' });

        // Seleciona produtos pela ID de usuario
        db.all('SELECT id FROM products WHERE seller_id = ?', [userId], (pErr, rows) => {
            if (pErr) return res.status(500).json({ error: pErr.message });
            const ids = (rows || []).map(r => r.id);
            
            // Remove diretorios de imagens
            ids.forEach(pid => {
                try {
                    const dir = path.join(__dirname, '..', 'public', 'images', 'ads', String(pid));
                    if (fs.existsSync(dir)) {
                        fs.rmSync(dir, { recursive: true, force: true });
                    }
                } catch (e) {
                    console.log('Could not remove image dir for product', pid, e.message);
                }
            });

            // Deleta referencias de imagens e produtos
            const placeholders = ids.map(() => '?').join(',') || 'NULL';
            if (ids.length > 0) {
                db.run(`DELETE FROM product_images WHERE product_id IN (${placeholders})`, ids, (diErr) => {
                    if (diErr) console.log('Could not delete product_images for seller', diErr.message);
                    db.run(`DELETE FROM products WHERE id IN (${placeholders})`, ids, (dpErr) => {
                        if (dpErr) console.log('Could not delete products for seller', dpErr.message);
                        
                        // Deleta usuario
                        db.run('DELETE FROM users WHERE id = ?', [userId], function(duErr) {
                            if (duErr) return res.status(500).json({ error: duErr.message });
                            res.json({ deleted_user: this.changes > 0 });
                        });
                    });
                });
            } else {
                // Sem produtos - apenas deleta usuario
                db.run('DELETE FROM users WHERE id = ?', [userId], function(duErr) {
                    if (duErr) return res.status(500).json({ error: duErr.message });
                    res.json({ deleted_user: this.changes > 0 });
                });
            }
        });
    });
});

// Aprovar um produto (set status = 'allowed')
app.post('/api/admin/approve-product/:id', (req, res) => {
    const adminId = req.header('x-admin-id') || req.query.admin_id;
    const productId = req.params.id;
    isAdmin(adminId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!ok) return res.status(403).json({ error: 'Admin privileges required' });
        db.run("UPDATE products SET status = 'allowed' WHERE id = ?", [productId], function(perr) {
            if (perr) return res.status(500).json({ error: perr.message });
            res.json({ approved: this.changes > 0 });
        });
    });
});

// Bloquear um produto (set status = 'blocked')
app.post('/api/admin/block-product/:id', (req, res) => {
    const adminId = req.header('x-admin-id') || req.query.admin_id;
    const productId = req.params.id;
    isAdmin(adminId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!ok) return res.status(403).json({ error: 'Admin privileges required' });
        db.run("UPDATE products SET status = 'blocked' WHERE id = ?", [productId], function(perr) {
            if (perr) return res.status(500).json({ error: perr.message });
            res.json({ blocked: this.changes > 0 });
        });
    });
});

// Deletar um produto (admin)
app.delete('/api/admin/product/:id', (req, res) => {
    const adminId = req.header('x-admin-id') || req.query.admin_id;
    const productId = req.params.id;
    isAdmin(adminId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!ok) return res.status(403).json({ error: 'Admin privileges required' });
        
        // Remove diretorio de imagens
        try {
            const dir = path.join(__dirname, '..', 'public', 'images', 'ads', String(productId));
            if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
        } catch (e) { console.log('Could not remove image dir for product', productId, e.message); }

        products.deleteProduct(productId, (derr, result) => {
            if (derr) return res.status(500).json({ error: derr.message });
            res.json({ deleted: !!(result && result.deleted) });
        });
    });
});

// Listagem de produtos pendentes (somente admin)
app.get('/api/admin/products/pending', (req, res) => {
    const adminId = req.header('x-admin-id') || req.query.admin_id;
    isAdmin(adminId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!ok) return res.status(403).json({ error: 'Admin privileges required' });
        db.all("SELECT * FROM products WHERE status = 'pending' ORDER BY created_at DESC", [], (perr, rows) => {
            if (perr) return res.status(500).json({ error: perr.message });
            res.json({ results: rows });
        });
    });
});

// Lista todos os produtos (admin)
app.get('/api/admin/products/all', (req, res) => {
    const adminId = req.header('x-admin-id') || req.query.admin_id;
    isAdmin(adminId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!ok) return res.status(403).json({ error: 'Admin privileges required' });
        db.all('SELECT * FROM products ORDER BY created_at DESC', [], (perr, rows) => {
            if (perr) return res.status(500).json({ error: perr.message });
            
            // Anexa imagens a cada produto
            if (!rows || rows.length === 0) return res.json({ results: rows });
            const base = `${req.protocol}://${req.get('host')}`;
            let remaining = rows.length;
            let firstErr = null;
            rows.forEach(r => {
                db.all('SELECT path FROM product_images WHERE product_id = ? ORDER BY created_at ASC', [r.id], (imgErr, imgRows) => {
                    if (imgErr && !firstErr) firstErr = imgErr;
                    r.images = (imgRows || []).map(img => `${base}${img.path}`);
                    remaining--;
                    if (remaining === 0) {
                        if (firstErr) return res.status(500).json({ error: firstErr.message });
                        res.json({ results: rows });
                    }
                });
            });
        });
    });
});

// Lista todos os usuarios (admin) — filtro opcional por aprovados/nao aprovados
app.get('/api/admin/users', (req, res) => {
    const adminId = req.header('x-admin-id') || req.query.admin_id;
    const approvedFilter = req.query.approved;
    isAdmin(adminId, (err, ok) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!ok) return res.status(403).json({ error: 'Admin privileges required' });
        let sql = 'SELECT id, public_id, name, email, role, approved, created_at FROM users';
        const params = [];
        if (approvedFilter !== undefined) {
            sql += ' WHERE approved = ?';
            params.push(Number(approvedFilter) ? 1 : 0);
        }
        sql += ' ORDER BY created_at DESC';
        db.all(sql, params, (uerr, rows) => {
            if (uerr) return res.status(500).json({ error: uerr.message });
            res.json({ results: rows });
        });
    });
});

// Helper para obter IP local (primeiro IPv4 nao-interno)
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
    
    // Previne supervisores de criarem anuncios
    const sellerId = product.seller_id;
    if (!sellerId) return res.status(400).json({ error: 'seller_id is required' });
    db.get('SELECT role FROM users WHERE id = ?', [sellerId], (uErr, row) => {
        if (uErr) return res.status(500).json({ error: uErr.message });
        const role = (row && row.role) || 'user';
        if (role === 'supervisor') return res.status(403).json({ error: 'Supervisor accounts cannot create ads' });
        products.createProduct(product, (err, row2) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ product: row2 });
        });
    });
});

// Produtos gratuitos
app.get('/api/products/free', (req, res) => {
    const limit = parseInt(req.query.limit || '12', 10);
    products.getFreeProducts(limit, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const base = `${req.protocol}://${req.get('host')}`;
        (rows || []).forEach(r => { r.images = (r.images || []).map(p => `${base}${p}`); });
        res.json({ results: rows });
    });
});

// Produtos recentes
app.get('/api/products/recent', (req, res) => {
    const limit = parseInt(req.query.limit || '12', 10);
    // Busca produtos ordenados por data de criacao decrescente
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
        
        // Verifica se o produto e pendente ou bloqueado
        if (row.status !== 'allowed') {
            const adminId = req.header('x-admin-id') || req.query.admin_id;
            const sellerId = req.header('x-seller-id') || req.query.seller_id;
            
            // Permitir se for o dono do anuncio ou admin
            if (sellerId && parseInt(sellerId) === row.seller_id) {
                                
                // Publicante pode ver os anuncios dele (pendentes ou bloqueados)
                if (row.images && row.images.length) {
                    row.images = row.images.map(p => `${req.protocol}://${req.get('host')}${p}`);
                }
                return res.json({ product: row });
            }
            
            // Verifica se e admin
            return isAdmin(adminId, (iErr, ok) => {
                if (iErr) return res.status(500).json({ error: iErr.message });
                if (!ok) return res.status(404).json({ error: 'Product not found' });
                
                // Admin pode ver
                if (row.images && row.images.length) {
                    row.images = row.images.map(p => `${req.protocol}://${req.get('host')}${p}`);
                }
                return res.json({ product: row });
            });
        }

        // Prefixa imagens
        if (row.images && row.images.length) {
            row.images = row.images.map(p => `${req.protocol}://${req.get('host')}${p}`);
        }
        res.json({ product: row });
    });
});

// Pesquisa com filtros avançados
app.post('/api/products/search', (req, res) => {
    const filters = req.body;
    console.log('Received filters:', filters);
    
    products.searchProductsWithFilters(filters, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const base = `${req.protocol}://${req.get('host')}`;
        (rows || []).forEach(r => { r.images = (r.images || []).map(p => `${base}${p}`); });
        res.json({ results: rows });
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

// Produtos de um vendedor (meus anuncios)
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

    // Previne supervisores de favoritar anuncios
    db.get('SELECT role FROM users WHERE id = ?', [userId], (uErr, row) => {
        if (uErr) return res.status(500).json({ error: uErr.message });
        const role = (row && row.role) || 'user';
        if (role === 'supervisor') return res.status(403).json({ error: 'Supervisor accounts cannot favorite ads' });
        products.createFavorite(userId, productId, (err, ok) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ favorited: !!ok });
        });
    });
});

// Remover favorito
app.delete('/api/products/:id/favorite', (req, res) => {
    const productId = req.params.id;
    const userId = req.body.user_id || req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id is required' });
    db.get('SELECT role FROM users WHERE id = ?', [userId], (uErr, row) => {
        if (uErr) return res.status(500).json({ error: uErr.message });
        const role = (row && row.role) || 'user';
        if (role === 'supervisor') return res.status(403).json({ error: 'Supervisor accounts cannot favorite ads' });
        products.deleteFavorite(userId, productId, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ deleted: !!(result && result.deleted) });
        });
    });
});

// Lista favoritos de um usuario
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

// =========== IMAGE UPLOAD ENDPOINTS ============

// Armazenamento de imagens
const imagesDir = path.join(__dirname, '..', 'public', 'images', 'ads');
fs.mkdirSync(imagesDir, { recursive: true });
app.use('/images/ads', express.static(imagesDir));

// Multer setup - armazena imagens em pastas por produto
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const productId = req.params.id;
        const dest = path.join(imagesDir, String(productId));
        fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        // Inclui timestamp no nome do arquivo para evitar conflitos
        const name = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        cb(null, name);
    }
});
const upload = multer({ storage });

// Upload de imagens para um produto
app.post('/api/products/:id/images', upload.array('images', 8), (req, res) => {
    const productId = req.params.id;
    const relPaths = (req.files || []).map(f => `/images/ads/${productId}/${f.filename}`);

    // armazana caminhos no banco
    products.addImages(productId, relPaths, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        const abs = relPaths.map(p => `${req.protocol}://${req.get('host')}${p}`);
        res.json({ images: abs });
    });
});

// Lista imagens de um produto
app.get('/api/products/:id/images', (req, res) => {
    const productId = req.params.id;
    products.getImages(productId, (err, images) => {
        if (err) return res.status(500).json({ error: err.message });
        const abs = (images || []).map(p => `${req.protocol}://${req.get('host')}${p}`);
        res.json({ images: abs });
    });
});

// Deleta uma imagem pelo nome do arquivo
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

// ============ MESSAGING / CHAT ENDPOINTS ============

// Retorna conversas de um usuario
app.get('/api/conversations', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    console.log(`[CONVERSATIONS] Fetching for userId: ${userId}`);
    messages.getConversations(userId, (err, conversations) => {
        if (err) {
            console.error('[CONVERSATIONS] Error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log(`[CONVERSATIONS] Found ${conversations?.length || 0} conversations`);
        res.json({ conversations });
    });
});

// Retorna mensagens de uma conversa de um produto
app.get('/api/messages/:productId/:counterpartId', (req, res) => {
    const { productId, counterpartId } = req.params;
    const userId = req.query.userId;
    
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    messages.getMessages(productId, userId, counterpartId, (err, msgs) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ messages: msgs });
    });
});

// Envia nova mensagem
app.post('/api/messages', (req, res) => {
    const { productId, senderId, receiverId, message } = req.body;
    
    if (!productId || !senderId || !receiverId || !message) {
        return res.status(400).json({ error: 'productId, senderId, receiverId, and message are required' });
    }
    
    messages.sendMessage(productId, senderId, receiverId, message, (err, newMessage) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: newMessage });
    });
});

// Marca conversa como lida
app.patch('/api/messages/:productId/:counterpartId/read', (req, res) => {
    const { productId, counterpartId } = req.params;
    const userId = req.query.userId;
    
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    messages.markConversationAsRead(productId, userId, counterpartId, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Retorna numero de mensagens nao lidas para um usuario
app.get('/api/messages/unread/count', (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    
    messages.getUnreadCount(userId, (err, count) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ count });
    });
});

// Fallback JSON 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});