from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from giao_tiep import chatbot_response
from Transcribe_Summary import transcribe_audio, save_transcription
from Document_processing import start_conversation

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "media/audio"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Endpoint chatbot
@app.route('/chatbot', methods=['POST'])
def chatbot():
    data = request.json
    user_input = data.get("message", "")
    if not user_input:
        return jsonify({"error": "Message is required"}), 400
    
    response = chatbot_response(user_input)
    return jsonify({"response": response})

# Endpoint upload file và xử lý transcribe
@app.route('/transcribe', methods=['POST'])
def transcribe():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    context = request.form.get("context", "")

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        file.save(file_path)

        transcription = transcribe_audio(file_path, context)
        output_path = save_transcription(transcription)

        os.remove(file_path)

        # Trả về file đã tạo
        return send_file(output_path, as_attachment=True)

# New endpoint for document processing
@app.route('/process_document', methods=['POST'])
def process_document():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join("media/documents", filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        file.save(file_path)

        summary = start_conversation(file_path)

        os.remove(file_path)

        return jsonify({"summary": summary})

if __name__ == '__main__':
    app.run(debug=True)
