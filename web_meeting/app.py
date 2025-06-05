from flask import Flask, jsonify, request, send_file # general flask imports
from flask_socketio import SocketIO, emit, join_room, leave_room # socketio imports for webrtc
from flask_cors import CORS # cors
from webrtc import setup_webrtc # webrtc setup
from datetime import datetime # for timestamping the uploaded file
import uuid # for generating unique meeting IDs
import sys # for system-level operations
import os # for file operations
from dotenv import load_dotenv # for loading environment variables

from utils.Debugger import Debugger
from utils.RateLimiter import RateLimiter

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*", manage_session=False)

UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '..' ,'web_recordings'))

# In-memory storage for each session
session_storage = {}

# Central RateLimiter
rate_limiter = RateLimiter(max_users_per_meeting=3, rate_limit_time_window=5)

# Setup routes and sockets
@app.route('/api/create-meeting', methods=['POST'])
def create_meeting():
    meeting_id = str(uuid.uuid4())
    data = request.get_json()
    username = data.get('username', '')

    if not username:
        return jsonify({'error': 'Username cannot be empty'}), 400

    if meeting_id in session_storage:
        return jsonify({'error': 'Meeting ID already exists, please try again'}), 400

    session_storage[meeting_id] = {
        'host': username,
        'users': {},  # {username: sid}
    }

    Debugger.log_message('INFO', f'User {username} created a new meeting with ID: {meeting_id}')
    print(f"Meeting created: {meeting_id}")
    print(f"Current session storage: {session_storage}")

    return jsonify({'meeting_id': meeting_id})

@app.route('/api/session/<meeting_id>', methods=['GET'])
def get_session(meeting_id):
    Debugger.log_message('DEBUG', f'{session_storage}')
    if meeting_id not in session_storage:
        return jsonify({'error': 'Meeting ID not found'}), 404
    return jsonify(session_storage[meeting_id])

@app.route('/api/users/<meeting_id>', methods=['GET'])
def get_users(meeting_id):
    Debugger.log_message('DEBUG', f'{session_storage}')
    if meeting_id not in session_storage:
        return jsonify({'error': 'Meeting ID not found'}), 404
    if len(session_storage[meeting_id]['users']) > 7:
        return jsonify({'error': 'Meeting is full'}), 404

    return jsonify(list(session_storage[meeting_id]['users'].keys()))


@socketio.on('join')
def handle_join(data):
    meeting_id = data.get('meeting_id')
    username = data.get('username')

    if not meeting_id or meeting_id not in session_storage:
        Debugger.log_message('ERROR', f'Meeting ID {meeting_id} not found')
        emit('error', {'message': 'Meeting ID not found'}, to=request.sid)
        return

    # Proceed with the join process
    session = session_storage[meeting_id]
    session['users'][username] = request.sid

    # Emit user_joined event
    emit('user_joined', {'username': username, 'meeting_id': meeting_id}, room=meeting_id)


@socketio.on('disconnect')
def handle_disconnect():
    to_delete = []
    for meeting_id, session in session_storage.items():
        if request.sid in session['users'].values():
            username = [username for username, sid in session['users'].items() if sid == request.sid][0]
            del session['users'][username]
            if len(session['users']) == 0:
                to_delete.append(meeting_id)
            Debugger.log_message('INFO', f'User {request.sid} left the meeting', meeting_id)

            # Update rate limiter meta data
            rate_limiter.updateMeetingCount(meeting_id, "leave")

            emit('user_left', {'meeting_id': meeting_id, 'username': username}, room=meeting_id)

    # for meeting_id in to_delete:
    #     del session_storage[meeting_id]









# Route to handle file upload
@app.route('/api/upload-video', methods=['POST'])
def upload_file():
    if 'video' not in request.files:  # Match the formData key ('video') in your frontend
        return 'No file part', 400

    file = request.files['video']
    meeting_id = request.form.get('meeting_id')

    if not meeting_id:
        return 'meeting_id is required', 400

    if file.filename == '':
        return 'No selected file', 400

    if file and file.mimetype.startswith('video/'):  # Check if the uploaded file is a video
        # Generate a unique filename based on the current date and time
        # timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_extension = 'webm'  # Save the uploaded file as .webm
        file_name = f"recording_{meeting_id}.{file_extension}"
        file_path = os.path.join(UPLOAD_FOLDER, file_name)

        try:
            # Save the uploaded file
            file.save(file_path)
            Debugger.log_message('INFO', f'File saved at {file_path}')
            
            # Return immediately after the file is uploaded
            return 'File uploaded successfully.', 200

        except Exception as e:
            return f"Failed to upload file: {str(e)}", 500

    return 'Invalid file type. Only video files are allowed.', 400







"""
/////////
ENDPOINTS video file
/////////
"""
# endpoint to get the video file for a class
@app.route('/getVideo', methods=['GET'])
def get_video():
    meeting_id = request.args.get('meeting_id')

    if not meeting_id:
        return jsonify({'error': 'class_id is required'}), 400

    try:
        # Construct the file path
        video_path = os.path.join(UPLOAD_FOLDER, f'recording_{meeting_id}.webm')

        if not os.path.exists(video_path):
            return jsonify({'error': 'Video file does not exist on the server'}), 404

        # Send the video file
        return send_file(video_path, as_attachment=True)
    except Exception as e:
        return jsonify({'error': f'An error occurred while retrieving the video: {str(e)}'}), 500
    
# Endpoint to check if a video for a meeting exists
@app.route('/checkMeeting', methods=['GET'])
def check_meeting():
    meeting_id = request.args.get('meeting_link')
    
    print(f"Checking meeting with ID: {meeting_id}")

    if not meeting_id:
        return jsonify({'error': 'meeting_id is required'}), 400

    video_path = os.path.join(UPLOAD_FOLDER, f'recording_{meeting_id}.webm')
    print(f"Checking video path: {video_path}")

    if os.path.exists(video_path):
        print(f"Video file exists for meeting ID: {meeting_id}")
        return jsonify({'exists': True})
    else:
        return jsonify({'exists': False})


setup_webrtc(app, socketio, session_storage, Debugger.log_message)

if __name__ == '__main__':
    if os.getenv('TESTING', True):
        socketio.run(app, host="0.0.0.0", port=5002, debug=True, allow_unsafe_werkzeug=True)
    else:
        socketio.run(app, host="0.0.0.0", port=5002, debug=True)




# # Start the Flask-SocketIO server
# if __name__ == '__main__':
#     # Run the server on 0.0.0.0 to allow access from other machines on the network
#     socketio.run(app, host='0.0.0.0', port=5000, debug=True)
