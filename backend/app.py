from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)

@app.route("/gpt-summary", methods=["POST"])
def generate_summary():
    data = request.get_json()
    prompt = data.get("prompt")

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You're a professional career assistant AI."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=400
        )

        text = response.choices[0].message.content.strip()
        parts = text.split("\n\n")

        return jsonify({
            "summary": parts[0] if len(parts) > 0 else "",
            "why_connect": parts[1] if len(parts) > 1 else "",
            "message": parts[2] if len(parts) > 2 else ""
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
