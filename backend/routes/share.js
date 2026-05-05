const express = require('express');
const User = require('../models/User');
const Reminder = require('../models/Reminder');

const router = express.Router();

// ─── GET Web Page ────────────────────────────────────────────────────────────
router.get('/:referralCode', async (req, res) => {
  try {
    const referralCode = req.params.referralCode;
    const user = await User.findOne({ referralCode: referralCode.toUpperCase() });

    if (!user) {
      return res.status(404).send('<h1>Link not found / இணைப்பு கிடைக்கவில்லை</h1>');
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RemindMe - Shared Link</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f4f8; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); max-width: 400px; width: 90%; }
    .header-msg { color: #000080; font-size: 1.1rem; text-align: center; font-weight: bold; margin-bottom: 25px; }
    .tamil-text { font-size: 0.9rem; color: #555; text-align: center; margin-bottom: 20px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; color: #333; font-weight: bold; }
    input, select { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; box-sizing: border-box; font-size: 1rem; }
    .submit-btn { background: #4CAF50; color: white; border: none; padding: 12px; width: 100%; border-radius: 6px; font-size: 1.1rem; font-weight: bold; cursor: pointer; margin-top: 10px; }
    .submit-btn:hover { background: #45a049; }
  </style>
</head>
<body>
  <div class="card" id="formCard">
    <div class="header-msg">Don’t forget the birthdays and wedding dates of your loved ones.</div>
    <div class="tamil-text">உங்கள் அன்புக்குரியவர்களின் பிறந்தநாள் மற்றும் திருமண நாட்களை மறக்காதீர்கள்.</div>
    
    <form id="reminderForm">
      <div class="form-group">
        <label>Your Name (உங்கள் பெயர்)</label>
        <input type="text" id="name" required>
      </div>
      <div class="form-group">
        <label>Event Type (நிகழ்வு)</label>
        <select id="type">
          <option value="DOB">Birthday (பிறந்தநாள்)</option>
          <option value="Wedding">Wedding Anniversary (திருமண நாள்)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Relationship to ${user.username}</label>
        <select id="relationship">
          <option value="Friend">Friend</option>
          <option value="Relative">Relative</option>
          <option value="Colleague">Colleague</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Date (தேதி)</label>
        <input type="date" id="date" required>
      </div>
      <button type="submit" class="submit-btn">Done (முடிந்தது)</button>
    </form>
  </div>

  <div class="card" id="thankYouCard" style="display: none; text-align: center;">
    <h2 style="color: #4CAF50;">Thank you! / நன்றி!</h2>
    <p style="font-size: 1.1rem; color: #333; margin-bottom: 10px;">
      <b>${user.username}</b> will never forget your <span id="displayType">Birthday/Wedding day</span> anymore.
    </p>
    <p class="tamil-text">
      ${user.username} இனி உங்கள் விசேஷ நாளை மறக்கமாட்டார்.
    </p>
    <hr style="border: 0; height: 1px; background: #eee; margin: 20px 0;">
    <p style="color: #555; font-size: 0.95rem; line-height: 1.5;">
      If you also want to remember your important person's birthday or wedding date, click the Create My Account button below and enjoy.
    </p>
    <p class="tamil-text" style="margin-bottom: 20px;">
      நீங்களும் உங்கள் அன்புக்குரியவர்களின் பிறந்தநாள் அல்லது திருமண நாளை மறக்காமல் இருக்க, கீழே உள்ள Create Account பட்டனை அழுத்திப் பயன்படுத்துங்கள்.
    </p>
    
    <button onclick="goToApp()" style="background: #000080; color: white; border: none; padding: 15px; width: 100%; border-radius: 0px; font-size: 1.1rem; font-weight: bold; cursor: pointer;">
      Create Account
    </button>
  </div>

  <script>
    document.getElementById('reminderForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const payload = {
        personName: document.getElementById('name').value,
        type: document.getElementById('type').value,
        relationship: document.getElementById('relationship').value,
        date: document.getElementById('date').value,
      };

      try {
        const res = await fetch('/share/${referralCode}', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const typeVal = document.getElementById('type').value;
          document.getElementById('displayType').textContent = typeVal === 'DOB' ? 'Birthday' : 'Wedding day';
          document.getElementById('formCard').style.display = 'none';
          document.getElementById('thankYouCard').style.display = 'block';
        } else {
          alert('Error saving data');
        }
      } catch (err) {
        alert('Network Error');
      }
    });

    async function goToApp() {
      try {
        await navigator.clipboard.writeText('${referralCode}');
        alert('Referral Code ' + '${referralCode}' + ' copied! Please paste it during signup.');
      } catch (err) {
        alert('Please use Referral Code: ' + '${referralCode}' + ' during signup.');
      }
      // Redirect to local Expo frontend (assuming default port 8081)
      window.location.href = "http://localhost:8081";
    }
  </script>
</body>
</html>
    `;

    res.send(html);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// ─── POST Form Submission ──────────────────────────────────────────────────
router.post('/:referralCode', async (req, res) => {
  try {
    const referralCode = req.params.referralCode;
    const user = await User.findOne({ referralCode: referralCode.toUpperCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { personName, type, relationship, date } = req.body;

    const reminder = new Reminder({
      userId: user._id,
      personName,
      type,
      relationship,
      date
    });

    await reminder.save();
    res.status(201).json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding reminder', error: error.message });
  }
});

module.exports = router;
