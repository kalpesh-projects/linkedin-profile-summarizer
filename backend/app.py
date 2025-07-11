from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

app = Flask(__name__)
CORS(app)

@app.route("/gpt-summary", methods=["POST"])
def generate_summary():
    try:
        data = request.get_json()
        prompt = data.get("prompt")

        if not prompt:
            return jsonify({"error": "No prompt received"}), 400

        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You're a helpful assistant."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500
        )

        text = response.choices[0].message.content.strip()
        parts = text.split("\n\n")

        return jsonify({
            "summary": parts[0] if len(parts) > 0 else "",
            "why_connect": parts[1] if len(parts) > 1 else "",
            "message": parts[2] if len(parts) > 2 else ""
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("🚀 Starting Flask app")
    app.run(debug=True)
