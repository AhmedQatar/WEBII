const User = require('../../persistence/repositories/userRepository');
const Message = require('../../persistence/repositories/messageRepository');

async function assignBadges(userId) {
    const user = await User.findById(userId);
    const messagesSent = await Message.countDocuments({ sender: userId });

    if (messagesSent >= 100 && !user.badges.includes('100 Messages Sent')) {
        user.badges.push('100 Messages Sent');
    }

    if (!user.badges.includes('First Conversation')) {
        const firstReply = await Message.findOne({
            sender: userId,
        }).exists('receiver', true);
        if (firstReply) user.badges.push('First Conversation');
    }

    await user.save();
}

module.exports = { assignBadges };
