import os
import google.generativeai as genai
from werkzeug.utils import secure_filename

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
    "gemini-1.5-pro",
    generation_config=generation_configuration,
    safety_settings=safetySettings,
)

# Hàm xử lý transcribe file
def transcribe_audio(file_path, context=""):
    Pr = """Please listen to the audio file provided and transcribe it into a readable dialogue format. 
    Separate the roles of each speakers, for example, labeling them as 'Speaker A' and 'Speaker B' (or similar) 
    based on their voices and intonation even if the roles are not explicitly marked."""
    Promt = Pr + f" The context of the conversation is: {context}" if context else Pr

    try:
        # Upload file lên Generative AI
        print("Uploading file...")
        uploaded_file = genai.upload_file(file_path)

        # Transcribe
        print("Transcribing in process...")
        result = model.generate_content([uploaded_file, Promt])
        transcription = result.text.replace("result.text='", "").strip()

        return transcription

    except Exception as e:
        return f"Error during transcription: {str(e)}"

# Hàm lưu transcription vào file
def save_transcription(transcription, output_dir="media"):
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "transcription.txt")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(transcription)
    return output_path

"""a = transcribe_audio("E:/Học tập/College/CRP/project/Virtual-Assistant-with-Gemini-API-1/be/media/audio/Em Là Nhất.mp3", "song" )
print(a)"""