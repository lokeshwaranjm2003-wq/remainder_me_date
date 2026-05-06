const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Reminder = require('../models/Reminder');

const router = express.Router();

router.get('/:referralCode', async (req, res) => {
  try {
    const referralCode = req.params.referralCode;
    const user = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!user) return res.status(404).send('<h1>Link not found</h1>');
    const name = user.username;
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>RemindMe - Share</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #f0f4f8, #d9e2ec); margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; box-sizing: border-box; }
    .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); max-width: 400px; width: 100%; animation: fadeIn 0.5s ease; box-sizing: border-box; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    h2 { color: #102a43; text-align: center; margin-bottom: 5px; margin-top: 0; }
    .subtitle { text-align: center; color: #627d98; margin-bottom: 25px; font-size: 0.95rem; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: 600; color: #334e68; font-size: 0.9rem; }
    input, select { width: 100%; padding: 12px; border: 1px solid #bcccdc; border-radius: 8px; box-sizing: border-box; font-size: 1rem; transition: border-color 0.3s; }
    input:focus, select:focus { border-color: #4CAF50; outline: none; }
    .btn { background: #4CAF50; color: white; border: none; padding: 14px; width: 100%; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; transition: background 0.3s; margin-top: 10px; }
    .btn:hover { background: #43a047; }
    .btn-outline { background: transparent; color: #4CAF50; border: 2px solid #4CAF50; margin-top: 15px; }
    .btn-outline:hover { background: #f0fdf4; }
    #otherRelationshipContainer { display: none; margin-top: 10px; }
    .thank-you-icon { font-size: 4rem; text-align: center; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="card" id="formCard">
    <h2>${name} shares with you</h2>
    <p class="subtitle">Enter your special date so ${name} never forgets!</p>
    <form id="reminderForm">
      <div class="form-group">
        <label>Your Name</label>
        <input type="text" id="nameInput" required placeholder="E.g. John Doe">
      </div>
      <div class="form-group">
        <label>Event Type</label>
        <select id="type">
          <option value="DOB">Birthday</option>
          <option value="Wedding">Wedding Anniversary</option>
        </select>
      </div>
      <div class="form-group">
        <label>Relationship with ${name}</label>
        <select id="relationship" onchange="toggleOther()">
          <option value="Friend">Friend</option>
          <option value="Relative">Relative</option>
          <option value="Colleague">Colleague</option>
          <option value="Other">Other</option>
        </select>
        <div id="otherRelationshipContainer">
          <input type="text" id="otherRelationship" placeholder="Specify relationship (E.g. Classmate)">
        </div>
      </div>
      <div class="form-group">
        <label>Your Phone Number (Optional)</label>
        <input type="tel" id="contactNumber" placeholder="+91...">
      </div>
      <div class="form-group">
        <label>Date</label>
        <input type="date" id="date" required>
      </div>
      <button type="submit" class="btn">Save Date</button>
    </form>
  </div>
  
  <div class="card" id="thankYouCard" style="display:none;text-align:center">
    <div class="thank-you-icon">🎉</div>
    <h2 style="color:#4CAF50">Thank You!</h2>
    <p class="subtitle">${name} will get notified on your special day.</p>
    <hr style="border:0; border-top:1px solid #eee; margin: 25px 0;">
    <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">Want to get automated reminders for your loved ones too?</p>
    <button class="btn btn-outline" onclick="window.location.href='/'">Create Your Own RemindMe</button>
  </div>

  <script>
    function toggleOther() {
      const rel = document.getElementById("relationship").value;
      document.getElementById("otherRelationshipContainer").style.display = (rel === 'Other') ? 'block' : 'none';
      if(rel === 'Other') {
        document.getElementById("otherRelationship").required = true;
      } else {
        document.getElementById("otherRelationship").required = false;
        document.getElementById("otherRelationship").value = "";
      }
    }

    document.getElementById("reminderForm").addEventListener("submit", async(e) => {
      e.preventDefault();
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.innerText = "Saving...";
      submitBtn.disabled = true;
      
      let relValue = document.getElementById("relationship").value;
      if (relValue === 'Other') {
        relValue = document.getElementById("otherRelationship").value;
      }

      const p = {
        personName: document.getElementById("nameInput").value,
        type: document.getElementById("type").value,
        relationship: relValue,
        date: document.getElementById("date").value,
        contactNumber: document.getElementById("contactNumber").value
      };

      try {
        const r = await fetch(window.location.href, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(p)
        });
        if(r.ok) {
          document.getElementById("formCard").style.display = "none";
          document.getElementById("thankYouCard").style.display = "block";
        } else {
          alert("Error saving details. Please try again.");
          submitBtn.innerText = "Save Date";
          submitBtn.disabled = false;
        }
      } catch (err) {
        alert("Network error. Please try again.");
        submitBtn.innerText = "Save Date";
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`;

    res.send(html);
  } catch (e) {
    console.error('[SHARE GET]', e);
    res.status(500).send('Server Error');
  }
});

router.post('/:referralCode', async (req, res) => {
  try {
    const referralCode = req.params.referralCode;
    const user = await User.findOne({ referralCode: referralCode.toUpperCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { personName, type, relationship, date, contactNumber } = req.body;
    const reminder = new Reminder({ userId: user._id, personName, type, relationship, date, contactNumber });
    await reminder.save();
    
    const BOT = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT = process.env.TELEGRAM_CHAT_ID;
    if (BOT && CHAT) {
      try {
        const lines = [
          '🎊 <b>New Special Date Added!</b> 🎊',
          '',
          '<b>1. Owner Name:</b> ' + user.username,
          '<b>2. Person Name:</b> ' + personName,
          '<b>3. Event:</b> ' + type,
          '<b>4. Relationship:</b> ' + relationship,
          '<b>5. Date:</b> ' + date,
          '<b>6. Contact:</b> ' + (contactNumber || 'Not provided')
        ];
        await axios.post('https://api.telegram.org/bot' + BOT + '/sendMessage', { 
          chat_id: CHAT, 
          text: lines.join('\n'),
          parse_mode: 'HTML'
        });
        console.log('[TELEGRAM] Notification sent');
      } catch (err) {
        console.error('[TELEGRAM] Error:', err.response ? err.response.data : err.message);
      }
    }
    res.status(201).json({ message: 'Success' });
  } catch (e) {
    console.error('[SHARE POST]', e);
    res.status(500).json({ message: 'Error', error: e.message });
  }
});

module.exports = router;