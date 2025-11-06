// messageserver.js
// Handles all chat/messaging logic for UNIBrik

const db = require('./database');

/**
 * Get all conversations for a user
 * Groups messages by product and counterpart, returns latest message for each conversation
 */
function getConversations(userId, cb) {
  // First, get all distinct conversation pairs
  const sql = `
    SELECT DISTINCT
      m.product_id,
      CASE 
        WHEN m.sender_id = ? THEN m.receiver_id 
        ELSE m.sender_id 
      END as counterpart_id,
      p.title as product_title,
      u.name as counterpart_name,
      u.picture as counterpart_picture
    FROM messages m
    JOIN products p ON p.id = m.product_id
    LEFT JOIN users u ON u.id = (CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END)
    WHERE m.sender_id = ? OR m.receiver_id = ?
  `;
  
  db.all(sql, [userId, userId, userId, userId], (err, rows) => {
    if (err) return cb(err);
    if (!rows || rows.length === 0) return cb(null, []);
    
    // For each conversation, get the last message and unread count
    let remaining = rows.length;
    const results = [];
    
    rows.forEach(row => {
      // Get last message
      db.get(`
        SELECT message, created_at
        FROM messages
        WHERE product_id = ?
          AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
        ORDER BY created_at DESC
        LIMIT 1
      `, [row.product_id, userId, row.counterpart_id, row.counterpart_id, userId], (err2, lastMsg) => {
        
        // Get unread count
        db.get(`
          SELECT COUNT(*) as count
          FROM messages
          WHERE product_id = ?
            AND receiver_id = ?
            AND sender_id = ?
            AND read = 0
        `, [row.product_id, userId, row.counterpart_id], (err3, unreadRow) => {
          
          results.push({
            ...row,
            last_message: lastMsg?.message || '',
            last_message_time: lastMsg?.created_at || '',
            unread_count: unreadRow?.count || 0
          });
          
          remaining--;
          if (remaining === 0) {
            // Sort by last message time
            results.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
            cb(null, results);
          }
        });
      });
    });
  });
}

/**
 * Get all messages between two users about a specific product
 */
function getMessages(productId, userId, counterpartId, cb) {
  const sql = `
    SELECT 
      m.*,
      u.name as sender_name,
      u.picture as sender_picture
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.product_id = ?
      AND ((m.sender_id = ? AND m.receiver_id = ?) OR 
           (m.sender_id = ? AND m.receiver_id = ?))
    ORDER BY m.created_at ASC
  `;
  
  db.all(sql, [productId, userId, counterpartId, counterpartId, userId], cb);
}

/**
 * Send a new message
 */
function sendMessage(productId, senderId, receiverId, message, cb) {
  const sql = `
    INSERT INTO messages (product_id, sender_id, receiver_id, message)
    VALUES (?, ?, ?, ?)
  `;
  
  db.run(sql, [productId, senderId, receiverId, message], function(err) {
    if (err) return cb(err);
    
    // Return the created message with sender info
    db.get(`
      SELECT m.*, u.name as sender_name, u.picture as sender_picture
      FROM messages m
      JOIN users u ON u.id = m.sender_id
      WHERE m.id = ?
    `, [this.lastID], cb);
  });
}

/**
 * Mark a message as read
 */
function markAsRead(messageId, cb) {
  const sql = `UPDATE messages SET read = 1 WHERE id = ?`;
  db.run(sql, [messageId], function(err) {
    if (err) return cb(err);
    cb(null, { updated: this.changes });
  });
}

/**
 * Mark all messages in a conversation as read
 */
function markConversationAsRead(productId, userId, counterpartId, cb) {
  const sql = `
    UPDATE messages 
    SET read = 1 
    WHERE product_id = ? 
      AND receiver_id = ? 
      AND sender_id = ?
      AND read = 0
  `;
  
  db.run(sql, [productId, userId, counterpartId], function(err) {
    if (err) return cb(err);
    cb(null, { updated: this.changes });
  });
}

/**
 * Get unread message count for a user
 */
function getUnreadCount(userId, cb) {
  const sql = `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read = 0`;
  db.get(sql, [userId], (err, row) => {
    if (err) return cb(err);
    cb(null, row.count);
  });
}

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  markConversationAsRead,
  getUnreadCount
};
