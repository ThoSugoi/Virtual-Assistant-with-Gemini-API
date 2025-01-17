import os
import google.generativeai as genai
from werkzeug.utils import secure_filename
from Transcribe_Summary import transcribe_audio

# Cấu hình API key và Generative AI
os.environ["API_KEY"] = "API_KEY"
genai.configure(api_key=os.environ["API_KEY"])

generation_configuration = {"temperature": 0.7, "top_p": 1, "top_k": 1}
safetySettings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

model = genai.GenerativeModel(
    "gemini-1.5-flash-8b",
    generation_config=generation_configuration,
    safety_settings=safetySettings,
)
import google.generativeai as genai

myfile = genai.upload_file("E:/Học tập/College/CRP/project/Virtual-Assistant-with-Gemini-API-1/be\media/audio/Em Là Nhất.mp3")
print(f"{myfile=}")

model = genai.GenerativeModel("gemini-1.5-flash")
result = model.generate_content([myfile, "Describe this audio clip"])
print(f"{result.text=}")

print(transcribe_audio("E:/Học tập/College/CRP/project/Virtual-Assistant-with-Gemini-API-1/be\media/audio/Em Là Nhất.mp3", "Song"))