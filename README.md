# 🔍 LinkedIn Profile Summarizer  
*A Chrome Extension + Flask GPT Backend to summarize LinkedIn profiles*

This is a passion project to summarize any LinkedIn profile using OpenAI’s GPT API. Built with a Chrome extension frontend and a Python Flask backend.

---

## ✨ Features

- ✅ Extracts Headline, About, and Experience from LinkedIn profiles
- 🤖 Sends a structured prompt to GPT
- 📌 Outputs a 5-point summary (clean, crisp)
- 🤝 Gives a clear reason to connect — written objectively
- 💬 Generates a professional connection message — ready to send

---

## 🗂️ Folder Structure

linkedin-profile-summarizer/
├── extension/         # Chrome extension code
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   ├── background.js
│   ├── style.css
│   └── icon.png
├── backend/           # Flask backend (OpenAI integration)
│   ├── app.py
│   ├── requirements.txt
│   └── .env.example
├── .gitignore
└── README.md

---

## 🚀 Getting Started (Local Setup)

This project is not deployed. It’s built for **local use and learning**.

### ✅ Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/linkedin-profile-summarizer.git
cd linkedin-profile-summarizer
````

### ✅ Step 2: Setup the Flask Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
copy .env.example .env      # or manually create `.env`
```

Edit `.env` and add your OpenAI key:

```
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Then start the backend:

```bash
python app.py
```

🟢 Your Flask server will now run at `http://127.0.0.1:5000`.

---

### ✅ Step 3: Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select the `extension/` folder inside this repo
5. Visit any LinkedIn profile (`linkedin.com/in/…`) and click the extension icon!

---

## 💬 Contributing

This is a learning-focused, community-friendly project.

* 🌟 Star it if you like it
* 🛠️ Fork and improve it
* 🐞 Raise an issue if something breaks
* 🤝 Open a PR if you add something cool

---

## 🔐 .env Example

```
OPENAI_API_KEY=your-openai-api-key-here
```

👉 Never share your real key publicly.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE)

---

## 🙌 Made by

**Kalpesh Ghadigaonkar**
[LinkedIn](https://www.linkedin.com/in/kalpeshghadigaonkar) | [Instagram](https://instagram.com/dataanalystduo)

> Built for learning. Built with ❤️. Not affiliated with LinkedIn or OpenAI.

```
