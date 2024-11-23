const express = require('express');
const router = express.Router();
const Message = require('../../business/models/messageModel');
const isAuthenticated = require('../../middleware/isAuthenticated');

router.get('/', isAuthenticated, async(req, res)=>{
    res.render('messages')
})

// Get all messages between two users
router.get('/:userId', isAuthenticated, async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.session.userId;

    try {
        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId },
            ],
        })
            .sort({ timestamp: 1 })
            .populate('sender', 'email') // Populate sender email
            .populate('recipient', 'email'); // Populate recipient email

        res.render('message', { messages, recipientId: userId });
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        res.status(500).send('Error fetching messages');
    }
});

// Send a new message
router.post('/:userId', isAuthenticated, async (req, res) => {
    const { userId } = req.params;
    const { content } = req.body;
    const currentUserId = req.session.userId;

    try {
        const newMessage = new Message({
            sender: currentUserId,
            recipient: userId,
            content,
        });

        await newMessage.save();

        res.redirect(`/messages/${userId}`); // Redirect back to the chat
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(500).send('Error sending message');
    }
});

module.exports = router;
