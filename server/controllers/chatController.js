 
const ruleReplies = [
    { keys: ['price', 'rate', 'kitna', 'kimat'], reply: "Sab rooms Rs 1500 per night se shuru hote hain! AC, WiFi, Attached Bathroom sab included." },
    { keys: ['ram mandir', 'mandir', 'temple'], reply: "Ram Mandir sirf 5 minute walking distance par hai! Free shuttle service bhi available hai." },
    { keys: ['book', 'booking', 'reserve'], reply: "Booking ke liye kisi bhi room par 'Book Now' click karein. Ya call karein: +91-9315377668" },
    { keys: ['food', 'khana', 'restaurant', 'breakfast'], reply: "Restaurant mein veg thali (Rs 250), Chinese, South Indian sab available hai. Room service 24/7!" },
    { keys: ['check in', 'checkin', 'check out', 'checkout'], reply: "Check-in: 12:00 PM | Check-out: 11:00 AM. Early check-in on request." },
    { keys: ['wifi', 'internet'], reply: "Bilkul! Free high-speed WiFi sabhi rooms aur common areas mein available hai." },
    { keys: ['parking', 'car', 'gaadi'], reply: "Free parking facility available hai, 50+ cars ke liye space hai." },
    { keys: ['ac', 'air condition'], reply: "Sabhi rooms AC ke saath aate hain - 24/7." },
    { keys: ['contact', 'phone', 'call', 'number'], reply: "Aap humein +91-9315377668 par call ya WhatsApp kar sakte hain." },
    { keys: ['ayodhya', 'tourist', 'dekhne', 'place'], reply: "Ayodhya mein must-visit: Ram Mandir, Hanuman Garhi, Kanak Bhawan, Saryu Ghat, Dashrath Mahal!" },
    { keys: ['cancel', 'refund'], reply: "Cancellation ke liye 'My Bookings' page par 'Request Cancellation' click karein. Admin approve karega." },
    { keys: ['hi', 'hello', 'namaste', 'hey'], reply: "Namaste! Main Siyaram Assistant hoon. Aapki kya madad kar sakta hoon?" },
    { keys: ['thank', 'shukriya', 'dhanyavad'], reply: "Aapka swagat hai! Koi aur sawaal ho to zaroor puchein." }
];

function getRuleReply(message) {
    const lower = message.toLowerCase();
    for (const rule of ruleReplies) {
        for (const kw of rule.keys) {
            if (lower.includes(kw)) return rule.reply;
        }
    }
    return "Is baare mein mujhe jaankari nahi hai. Aap humein +91-9315377668 par call ya WhatsApp kar sakte hain!";
}

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, reply: 'Please type a message' });
        }

        const reply = getRuleReply(message);
        res.json({ success: true, reply, timestamp: new Date() });
    } catch (error) {
        res.status(500).json({ success: false, reply: 'Something went wrong. Please try again.' });
    }
};

module.exports = { chat };