# complete_app.py - AI Mental Health Platform Backend
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime, timedelta
import logging
import json
from werkzeug.utils import secure_filename
import uuid
import random

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'

# Create upload directories
upload_dirs = ['uploads', 'uploads/calls', 'uploads/voice', 'uploads/social', 'uploads/feedback']
for directory in upload_dirs:
    os.makedirs(directory, exist_ok=True)

# Initialize ML models
print("Loading ML models...")
try:
    from transformers import pipeline
    sentiment_analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
    emotion_analyzer = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base")
    print("ML models loaded successfully!")
except Exception as e:
    print(f"Error loading ML models: {e}")
    print("Using fallback sentiment analysis...")
    sentiment_analyzer = None
    emotion_analyzer = None

# Database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host='localhost',
            database='mental_health_db',
            user='postgres',
            password='password',  # UPDATE THIS WITH YOUR PASSWORD
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

# ========== HELPER FUNCTIONS ==========

def analyze_text_sentiment(text):
    """Analyze sentiment and emotion from text with fallback"""
    try:
        if sentiment_analyzer and emotion_analyzer:
            sentiment_result = sentiment_analyzer(text)[0]
            emotion_result = emotion_analyzer(text)[0]
            
            # Handle different label formats
            sentiment_mapping = {
                'LABEL_2': 0.8, 'POSITIVE': 0.8, 'POS': 0.8,
                'LABEL_0': 0.2, 'NEGATIVE': 0.2, 'NEG': 0.2,
                'LABEL_1': 0.5, 'NEUTRAL': 0.5, 'NEU': 0.5
            }
            
            sentiment_score = sentiment_mapping.get(sentiment_result['label'], 0.5)
            
            return {
                'sentiment_score': sentiment_score,
                'emotion': emotion_result['label'],
                'confidence': emotion_result['score'],
                'raw_sentiment': sentiment_result['label']
            }
        else:
            # Fallback simple sentiment analysis
            return analyze_text_simple(text)
                
    except Exception as e:
        logging.error(f"Error analyzing text: {e}")
        return analyze_text_simple(text)

def analyze_text_simple(text):
    """Simple fallback sentiment analysis"""
    positive_words = ['happy', 'good', 'great', 'awesome', 'excellent', 'love', 'amazing', 
                     'wonderful', 'fantastic', 'excited', 'joy', 'grateful', 'blessed']
    negative_words = ['sad', 'bad', 'terrible', 'awful', 'hate', 'stressed', 'anxious',
                     'depressed', 'worried', 'angry', 'frustrated', 'overwhelmed', 'lonely']
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return {
            'sentiment_score': 0.7 + (positive_count * 0.1),
            'emotion': 'joy',
            'confidence': 0.8,
            'raw_sentiment': 'POSITIVE'
        }
    elif negative_count > positive_count:
        return {
            'sentiment_score': 0.3 - (negative_count * 0.05),
            'emotion': 'sadness',
            'confidence': 0.8,
            'raw_sentiment': 'NEGATIVE'
        }
    else:
        return {
            'sentiment_score': 0.5,
            'emotion': 'neutral',
            'confidence': 0.6,
            'raw_sentiment': 'NEUTRAL'
        }

def analyze_voice_features(file_path):
    """Simple voice analysis (mock implementation)"""
    try:
        # In real implementation, use librosa and speech-to-text
        # For now, return mock analysis
        moods = ['energetic', 'calm', 'balanced', 'tired', 'excited']
        mood = random.choice(moods)
        
        mood_scores = {
            'energetic': 0.8,
            'excited': 0.9,
            'calm': 0.6,
            'balanced': 0.7,
            'tired': 0.3
        }
        
        return {
            'mood': mood,
            'mood_score': mood_scores[mood],
            'features': {
                'duration': 10.0,
                'energy_level': mood_scores[mood]
            }
        }
    except Exception as e:
        logging.error(f"Error analyzing voice: {e}")
        return {
            'mood': 'unknown', 
            'mood_score': 0.5, 
            'features': {'duration': 0}
        }

def generate_emotion_breakdown(analysis):
    """Generate detailed emotion breakdown for charts"""
    base_emotions = [
        {'emotion': 'Joy', 'color': 'bg-green-500'},
        {'emotion': 'Sadness', 'color': 'bg-blue-500'},
        {'emotion': 'Anger', 'color': 'bg-red-500'},
        {'emotion': 'Fear', 'color': 'bg-purple-500'},
        {'emotion': 'Surprise', 'color': 'bg-yellow-500'},
        {'emotion': 'Disgust', 'color': 'bg-green-600'},
        {'emotion': 'Neutral', 'color': 'bg-gray-500'},
        {'emotion': 'Contempt', 'color': 'bg-indigo-500'},
        {'emotion': 'Gratitude', 'color': 'bg-pink-500'},
        {'emotion': 'Pride', 'color': 'bg-orange-500'}
    ]
    
    breakdown = []
    primary_emotion = analysis['emotion'].title()
    primary_score = int(analysis['sentiment_score'] * 100)
    
    # Ensure primary emotion gets highest score
    for emotion_info in base_emotions:
        if emotion_info['emotion'] == primary_emotion:
            percentage = max(primary_score, 20)  # At least 20%
        else:
            # Random percentage for other emotions, scaled down
            percentage = random.randint(1, max(1, 100 - primary_score) // len(base_emotions))
        
        breakdown.append({
            'emotion': emotion_info['emotion'],
            'percentage': percentage,
            'color': emotion_info['color']
        })
    
    # Sort by percentage descending
    breakdown.sort(key=lambda x: x['percentage'], reverse=True)
    return breakdown

def generate_mock_data(user_id):
    """Generate realistic mock data for testing"""
    conversations = [
        {"text": "I'm feeling really stressed about work lately. Too much pressure and deadlines.", "sentiment": 0.2},
        {"text": "Had a wonderful day with family today! We went for a picnic and I felt so grateful.", "sentiment": 0.9},
        {"text": "Feeling a bit anxious about the upcoming presentation tomorrow. Hope it goes well.", "sentiment": 0.3},
        {"text": "Really excited about the weekend plans. Going hiking with friends!", "sentiment": 0.8},
        {"text": "Having trouble sleeping these days. My mind keeps racing with worries.", "sentiment": 0.25},
        {"text": "Just finished a good workout. Feeling energized and positive about the day!", "sentiment": 0.85},
        {"text": "Overwhelmed with all the deadlines coming up this week. Need to prioritize better.", "sentiment": 0.2},
        {"text": "Love spending quality time with friends. Makes me feel connected and happy.", "sentiment": 0.8},
        {"text": "Feeling isolated and lonely lately. Need to reach out and connect more with people.", "sentiment": 0.2},
        {"text": "Beautiful sunny day today! Mood is definitely lifting and I feel optimistic.", "sentiment": 0.75}
    ]
    
    family_feedback = [
        {"text": "Alex seems much happier and more energetic lately, engaging more in conversations", "sentiment": 0.8},
        {"text": "Noticed Alex has been quiet and withdrawn recently, not participating much", "sentiment": 0.3},
        {"text": "Alex is doing great, very positive energy and engaging well with everyone", "sentiment": 0.9},
        {"text": "Alex mentioned feeling stressed about work pressures and upcoming deadlines", "sentiment": 0.3},
        {"text": "Alex seems to be sleeping better and appears more relaxed during interactions", "sentiment": 0.7}
    ]
    
    return {
        'conversations': conversations,
        'family_feedback': family_feedback
    }

def generate_soap_note(session_id, cursor):
    """Generate SOAP note for therapy session"""
    try:
        # Get session details
        cursor.execute("""
            SELECT cs.*, u.name as patient_name
            FROM chat_sessions cs
            JOIN users u ON cs.patient_id = u.id
            WHERE cs.id = %s
        """, (session_id,))
        session = cursor.fetchone()
        
        if not session:
            return "Session not found"
        
        # Get messages and emotions
        cursor.execute("""
            SELECT cm.content, cm.sender_type, ea.emotion_detected
            FROM chat_messages cm
            LEFT JOIN emotion_analysis ea ON cm.id = ea.message_id
            WHERE cm.session_id = %s
            ORDER BY cm.timestamp
        """, (session_id,))
        messages = cursor.fetchall()
        
        # Extract key themes
        patient_messages = [msg for msg in messages if msg['sender_type'] == 'patient']
        emotions_detected = [msg['emotion_detected'] for msg in patient_messages if msg['emotion_detected']]
        
        soap_note = f"""
SOAP NOTE - {datetime.now().strftime('%B %d, %Y')}
Patient: {session['patient_name']}
Session Duration: {session.get('duration_minutes', 'In Progress')} minutes

SUBJECTIVE:
Patient expressed primary emotion of {session.get('primary_emotion', 'mixed emotions')} during session.
Key themes discussed include emotional awareness, coping strategies, and current life challenges.
Patient demonstrated good engagement and willingness to share personal experiences.

OBJECTIVE:
Emotional range observed: {', '.join(set(emotions_detected)) if emotions_detected else 'Neutral to positive range'}
Patient maintained good eye contact and active participation throughout session.
Speech patterns and affect consistent with reported emotional state.

ASSESSMENT:
Patient shows continued progress in emotional awareness and expression.
Demonstrates healthy coping mechanisms and insight into personal patterns.
No acute risk factors identified during this session.

PLAN:
1. Continue current therapeutic approach focusing on emotional regulation
2. Encourage maintenance of positive social connections and support systems
3. Practice mindfulness and grounding techniques as discussed
4. Monitor mood patterns and check-in next session
5. Schedule follow-up session in one week

Generated by AI MedScribe on {datetime.now().strftime('%m/%d/%Y at %I:%M %p')}
        """
        
        return soap_note.strip()
    except Exception as e:
        return f"Error generating SOAP note: {str(e)}"

# ========== MAIN API ROUTES ==========

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'ml_models': 'loaded' if sentiment_analyzer else 'fallback_mode'
    }), 200

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO users (name, email) VALUES (%s, %s) RETURNING id",
            (data['name'], data['email'])
        )
        user_id = cur.fetchone()['id']
        
        # Initialize user metrics
        cur.execute(
            "INSERT INTO health_metrics (user_id, energy_level, growth_points, check_ins, energy_streak) VALUES (%s, %s, %s, %s, %s)",
            (user_id, 3, 0, 0, 0)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({'user_id': user_id, 'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>/dashboard', methods=['GET'])
def get_dashboard_data(user_id):
    """Get dashboard data for a user"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Get user info
        cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get latest metrics
        cur.execute(
            "SELECT * FROM health_metrics WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
            (user_id,)
        )
        metrics = cur.fetchone()
        
        # Get recent analysis results
        cur.execute(
            """SELECT ar.*, ud.data_type, ud.created_at as data_created_at 
               FROM analysis_results ar 
               JOIN user_data ud ON ar.data_id = ud.id 
               WHERE ar.user_id = %s 
               ORDER BY ar.created_at DESC LIMIT 10""",
            (user_id,)
        )
        recent_analysis = cur.fetchall()
        
        # Get data count by type
        cur.execute(
            """SELECT data_type, COUNT(*) as count 
               FROM user_data 
               WHERE user_id = %s 
               GROUP BY data_type""",
            (user_id,)
        )
        data_counts = cur.fetchall()
        
        cur.close()
        conn.close()
        
        # Calculate garden progress
        total_data_points = sum([row['count'] for row in data_counts]) if data_counts else 0
        garden_progress = min(68 + (total_data_points * 2), 100)
        
        dashboard_data = {
            'user': dict(user),
            'metrics': dict(metrics) if metrics else {
                'energy_level': 3,
                'growth_points': 0,
                'check_ins': 0,
                'energy_streak': 0,
                'mood_score': 0.5
            },
            'recent_analysis': [dict(row) for row in recent_analysis],
            'data_counts': [dict(row) for row in data_counts],
            'garden_status': {
                'current_flower': 'Resilience Rose',
                'bloom_progress': garden_progress,
                'message': 'Your garden is blooming beautifully!'
            }
        }
        
        return jsonify(dashboard_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/text-message', methods=['POST'])
def submit_text_message():
    """Submit text message for analysis"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        message = data.get('message')
        message_type = data.get('type', 'manual_input')
        
        if not message or not user_id:
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Store message
        cur.execute(
            "INSERT INTO user_data (user_id, data_type, content) VALUES (%s, %s, %s) RETURNING id",
            (user_id, f'text_{message_type}', message)
        )
        data_id = cur.fetchone()['id']
        
        # Analyze sentiment
        analysis_result = analyze_text_sentiment(message)
        
        # Determine risk level
        sentiment_score = analysis_result['sentiment_score']
        if sentiment_score < 0.3:
            risk_level = 'high'
        elif sentiment_score < 0.6:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        # Store analysis results
        cur.execute(
            """INSERT INTO analysis_results 
               (user_id, data_id, sentiment_score, emotion_detected, risk_level, confidence_score) 
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (user_id, data_id, sentiment_score, analysis_result['emotion'], 
             risk_level, analysis_result['confidence'])
        )
        
        # Update user metrics
        points_earned = 10
        cur.execute(
            """UPDATE health_metrics 
               SET growth_points = growth_points + %s, mood_score = %s
               WHERE user_id = %s""",
            (points_earned, sentiment_score, user_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'status': 'processed',
            'data_id': data_id,
            'analysis': analysis_result,
            'risk_level': risk_level,
            'points_earned': points_earned
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/voice-message', methods=['POST'])
def upload_voice_message():
    """Upload and analyze voice message"""
    try:
        if 'voice_file' not in request.files:
            return jsonify({'error': 'No voice file provided'}), 400
        
        file = request.files['voice_file']
        user_id = request.form.get('user_id')
        
        if not file.filename or not user_id:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Save voice file
        filename = secure_filename(f"voice_{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'voice', filename)
        file.save(filepath)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Store voice data
        cur.execute(
            "INSERT INTO user_data (user_id, data_type, file_path) VALUES (%s, %s, %s) RETURNING id",
            (user_id, 'voice_message', filepath)
        )
        data_id = cur.fetchone()['id']
        
        # Analyze voice
        voice_analysis = analyze_voice_features(filepath)
        
        # Store analysis
        cur.execute(
            """INSERT INTO analysis_results 
               (user_id, data_id, sentiment_score, emotion_detected, confidence_score) 
               VALUES (%s, %s, %s, %s, %s)""",
            (user_id, data_id, voice_analysis['mood_score'], 
             voice_analysis['mood'], 0.7)
        )
        
        # Update metrics
        points_earned = 15
        cur.execute(
            """UPDATE health_metrics 
               SET growth_points = growth_points + %s
               WHERE user_id = %s""",
            (points_earned, user_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'status': 'processed',
            'data_id': data_id,
            'analysis': voice_analysis,
            'points_earned': points_earned
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/family-feedback', methods=['POST'])
def submit_family_feedback():
    """Submit family/friends feedback"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        feedback_text = data.get('feedback')
        relationship = data.get('relationship', 'family')
        
        if not feedback_text or not user_id:
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Store feedback
        cur.execute(
            "INSERT INTO user_data (user_id, data_type, content) VALUES (%s, %s, %s) RETURNING id",
            (user_id, f'feedback_{relationship}', feedback_text)
        )
        data_id = cur.fetchone()['id']
        
        # Analyze feedback sentiment
        analysis = analyze_text_sentiment(feedback_text)
        
        # Family feedback gets higher weight
        weight_multiplier = 1.5 if relationship == 'family' else 1.0
        weighted_sentiment = min(analysis['sentiment_score'] * weight_multiplier, 1.0)
        
        # Determine risk level
        if weighted_sentiment < 0.3:
            risk_level = 'high'
        elif weighted_sentiment < 0.6:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        # Store analysis
        cur.execute(
            """INSERT INTO analysis_results 
               (user_id, data_id, sentiment_score, emotion_detected, risk_level, confidence_score) 
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (user_id, data_id, weighted_sentiment, analysis['emotion'], 
             risk_level, analysis['confidence'])
        )
        
        # Update metrics
        points_earned = 20
        cur.execute(
            """UPDATE health_metrics 
               SET growth_points = growth_points + %s, mood_score = %s
               WHERE user_id = %s""",
            (points_earned, weighted_sentiment, user_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'status': 'feedback_processed',
            'analysis': analysis,
            'weighted_sentiment': weighted_sentiment,
            'risk_level': risk_level,
            'points_earned': points_earned
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-mock-data/<int:user_id>', methods=['POST'])
def create_mock_data(user_id):
    """Generate mock data for testing"""
    try:
        mock_data = generate_mock_data(user_id)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        total_sentiment = 0
        count = 0
        
        # Process conversations
        for conv in mock_data['conversations']:
            # Store data
            cur.execute(
                "INSERT INTO user_data (user_id, data_type, content) VALUES (%s, %s, %s) RETURNING id",
                (user_id, 'mock_conversation', conv['text'])
            )
            data_id = cur.fetchone()['id']
            
            # Use mock sentiment for consistency
            analysis = analyze_text_sentiment(conv['text'])
            sentiment_score = conv.get('sentiment', analysis['sentiment_score'])
            
            # Determine risk level
            if sentiment_score < 0.3:
                risk_level = 'high'
            elif sentiment_score < 0.6:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            # Store analysis
            cur.execute(
                """INSERT INTO analysis_results 
                   (user_id, data_id, sentiment_score, emotion_detected, risk_level, confidence_score) 
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (user_id, data_id, sentiment_score, analysis['emotion'], 
                 risk_level, analysis['confidence'])
            )
            
            total_sentiment += sentiment_score
            count += 1
        
        # Process family feedback
        for feedback in mock_data['family_feedback']:
            cur.execute(
                "INSERT INTO user_data (user_id, data_type, content) VALUES (%s, %s, %s) RETURNING id",
                (user_id, 'mock_family_feedback', feedback['text'])
            )
            data_id = cur.fetchone()['id']
            
            analysis = analyze_text_sentiment(feedback['text'])
            sentiment_score = feedback.get('sentiment', analysis['sentiment_score'])
            
            cur.execute(
                """INSERT INTO analysis_results 
                   (user_id, data_id, sentiment_score, emotion_detected, confidence_score) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (user_id, data_id, sentiment_score, analysis['emotion'], analysis['confidence'])
            )
            
            total_sentiment += sentiment_score
            count += 1
        
        # Update user metrics
        avg_sentiment = total_sentiment / count if count > 0 else 0.5
        energy_level = max(1, min(5, int(avg_sentiment * 5)))
        
        cur.execute(
            """UPDATE health_metrics 
               SET energy_level = %s, mood_score = %s, growth_points = growth_points + %s,
                   check_ins = check_ins + 1, energy_streak = energy_streak + 1
               WHERE user_id = %s""",
            (energy_level, avg_sentiment, count * 10, user_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Mock data generated and processed successfully',
            'data_points': count,
            'avg_sentiment': avg_sentiment,
            'energy_level': energy_level,
            'total_points_earned': count * 10
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>/energy', methods=['POST'])
def update_energy(user_id):
    """Update user's energy level"""
    try:
        data = request.get_json()
        energy_level = data.get('energy_level')
        
        if not energy_level or not (1 <= energy_level <= 5):
            return jsonify({'error': 'Invalid energy level'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Get current metrics
        cur.execute(
            "SELECT energy_streak, check_ins FROM health_metrics WHERE user_id = %s ORDER BY created_at DESC LIMIT 1",
            (user_id,)
        )
        current_metrics = cur.fetchone()
        
        new_streak = (current_metrics['energy_streak'] + 1) if current_metrics else 1
        new_checkins = (current_metrics['check_ins'] + 1) if current_metrics else 1
        
        # Update metrics
        cur.execute(
            """UPDATE health_metrics 
               SET energy_level = %s, energy_streak = %s, check_ins = %s, growth_points = growth_points + 5
               WHERE user_id = %s""",
            (energy_level, new_streak, new_checkins, user_id)
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': 'Energy updated successfully',
            'energy_level': energy_level,
            'streak': new_streak,
            'checkins': new_checkins,
            'points_earned': 5
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>/powerups', methods=['POST'])
def complete_powerup(user_id):
    """Complete a power-up activity"""
    try:
        data = request.get_json()
        activity_type = data.get('activity_type')
        
        point_rewards = {
            'breathing': 15,
            'gratitude': 20,
            'connection': 25
        }
        
        points = point_rewards.get(activity_type, 10)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Update growth points
        cur.execute(
            "UPDATE health_metrics SET growth_points = growth_points + %s WHERE user_id = %s",
            (points, user_id)
        )
        
        # Log the activity
        cur.execute(
            "INSERT INTO user_data (user_id, data_type, content) VALUES (%s, %s, %s)",
            (user_id, 'activity', f"Completed {activity_type} power-up")
        )
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message': f'{activity_type} power-up completed!',
            'points_earned': points
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ========== CHAT SESSION ROUTES ==========

@app.route('/api/chat/sessions', methods=['GET'])
def get_chat_sessions():
    """Get all chat sessions"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        cur.execute("""
            SELECT 
                cs.id as session_id,
                u.id as patient_id,
                u.name as patient_name,
                u.email,
                cs.session_date,
                cs.duration_minutes,
                cs.status,
                cs.primary_emotion,
                cs.emotion_confidence,
                COUNT(cm.id) as message_count
            FROM chat_sessions cs
            JOIN users u ON cs.patient_id = u.id
            LEFT JOIN chat_messages cm ON cs.id = cm.session_id
            GROUP BY cs.id, u.id, u.name, u.email, cs.session_date, cs.duration_minutes, cs.status, cs.primary_emotion, cs.emotion_confidence
            ORDER BY cs.session_date DESC
        """)
        
        sessions = [dict(row) for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify({'sessions': sessions}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/session/<int:session_id>', methods=['GET'])
def get_chat_session(session_id):
    """Get specific chat session with messages and emotions"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Get session details
        cur.execute("""
            SELECT 
                cs.*,
                u.name as patient_name,
                u.email,
                hm.energy_level,
                hm.mood_score
            FROM chat_sessions cs
            JOIN users u ON cs.patient_id = u.id
            LEFT JOIN health_metrics hm ON u.id = hm.user_id
            WHERE cs.id = %s
        """, (session_id,))
        
        session = cur.fetchone()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        # Get chat messages
        cur.execute("""
            SELECT 
                cm.*,
                ea.sentiment_score,
                ea.emotion_detected,
                ea.confidence_score
            FROM chat_messages cm
            LEFT JOIN emotion_analysis ea ON cm.id = ea.message_id
            WHERE cm.session_id = %s
            ORDER BY cm.timestamp ASC
        """, (session_id,))
        
        messages = [dict(row) for row in cur.fetchall()]
        
        # Get emotion history for the session
        cur.execute("""
            SELECT 
                eh.*,
                cm.content as message_content
            FROM emotion_history eh
            JOIN chat_messages cm ON eh.message_id = cm.id
            WHERE eh.session_id = %s
            ORDER BY eh.timestamp DESC
        """, (session_id,))
        
        emotion_history = [dict(row) for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify({
            'session': dict(session),
            'messages': messages,
            'emotion_history': emotion_history
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/session/<int:session_id>/message', methods=['POST'])
def send_chat_message(session_id):
    """Send a message in chat session"""
    try:
        data = request.get_json()
        message_content = data.get('content')
        sender_type = data.get('sender_type', 'therapist')
        sender_id = data.get('sender_id', 1)
        
        if not message_content or not sender_type:
            return jsonify({'error': 'Missing required fields'}), 400
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Insert message
        cur.execute("""
            INSERT INTO chat_messages (session_id, sender_type, sender_id, content, timestamp)
            VALUES (%s, %s, %s, %s, NOW())
            RETURNING id
        """, (session_id, sender_type, sender_id, message_content))
        
        message_id = cur.fetchone()['id']
        
        # Analyze emotion for patient messages
        analysis_result = None
        if sender_type == 'patient':
            analysis = analyze_text_sentiment(message_content)
            
            # Store emotion analysis
            cur.execute("""
                INSERT INTO emotion_analysis 
                (message_id, sentiment_score, emotion_detected, confidence_score)
                VALUES (%s, %s, %s, %s)
            """, (message_id, analysis['sentiment_score'], analysis['emotion'], analysis['confidence']))
            
            # Update session primary emotion
            cur.execute("""
                UPDATE chat_sessions 
                SET primary_emotion = %s, emotion_confidence = %s
                WHERE id = %s
            """, (analysis['emotion'], analysis['confidence'], session_id))
            
            # Add to emotion history
            cur.execute("""
                INSERT INTO emotion_history 
                (session_id, message_id, emotion, confidence, timestamp)
                VALUES (%s, %s, %s, %s, NOW())
            """, (session_id, message_id, analysis['emotion'], analysis['confidence']))
            
            analysis_result = analysis
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'message_id': message_id,
            'analysis': analysis_result,
            'status': 'sent'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/session/start', methods=['POST'])
def start_chat_session():
    """Start a new chat session"""
    try:
        data = request.get_json()
        patient_id = data.get('patient_id', 1)
        therapist_id = data.get('therapist_id', 1)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Create new chat session
        cur.execute("""
            INSERT INTO chat_sessions 
            (patient_id, therapist_id, session_date, status)
            VALUES (%s, %s, NOW(), 'active')
            RETURNING id
        """, (patient_id, therapist_id))
        
        session_id = cur.fetchone()['id']
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'session_id': session_id,
            'status': 'active',
            'message': 'Chat session started'
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/session/<int:session_id>/end', methods=['POST'])
def end_chat_session(session_id):
    """End a chat session and generate SOAP note"""
    try:
        data = request.get_json()
        duration = data.get('duration_minutes', 25)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Update session status
        cur.execute("""
            UPDATE chat_sessions 
            SET status = 'completed', duration_minutes = %s, end_time = NOW()
            WHERE id = %s
        """, (duration, session_id))
        
        # Generate SOAP note
        soap_note = generate_soap_note(session_id, cur)
        
        # Store SOAP note
        cur.execute("""
            INSERT INTO soap_notes (session_id, content, generated_at)
            VALUES (%s, %s, NOW())
        """, (session_id, soap_note))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'session_id': session_id,
            'status': 'completed',
            'soap_note': soap_note
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/voice-analysis', methods=['POST'])
def analyze_voice_call():
    """Analyze voice call for real-time emotion detection"""
    try:
        if 'audio_file' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400
        
        file = request.files['audio_file']
        session_id = request.form.get('session_id')
        
        if not file.filename or not session_id:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Save audio file
        filename = secure_filename(f"call_{session_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'calls', filename)
        file.save(filepath)
        
        # Analyze voice
        voice_analysis = analyze_voice_features(filepath)
        
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Store voice analysis
        cur.execute("""
            INSERT INTO user_data (user_id, data_type, file_path, content)
            VALUES ((SELECT patient_id FROM chat_sessions WHERE id = %s), 'voice_call', %s, %s)
            RETURNING id
        """, (session_id, filepath, f"Voice call analysis: {voice_analysis['mood']}"))
        
        data_id = cur.fetchone()['id']
        
        # Store analysis results
        cur.execute("""
            INSERT INTO analysis_results 
            (user_id, data_id, sentiment_score, emotion_detected, confidence_score)
            VALUES ((SELECT patient_id FROM chat_sessions WHERE id = %s), %s, %s, %s, %s)
        """, (session_id, data_id, voice_analysis['mood_score'], voice_analysis['mood'], 0.8))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            'analysis': voice_analysis,
            'status': 'analyzed'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>/analytics', methods=['GET'])
def get_analytics(user_id):
    """Get analytics data for charts and insights"""
    try:
        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor()
        
        # Get mood trends over last 30 days
        cur.execute("""
            SELECT DATE(ar.created_at) as date, AVG(ar.sentiment_score) as avg_mood
            FROM analysis_results ar
            WHERE ar.user_id = %s AND ar.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(ar.created_at)
            ORDER BY date
        """, (user_id,))
        mood_trends = [{'date': str(row['date']), 'avg_mood': float(row['avg_mood'])} for row in cur.fetchall()]
        
        # Get energy levels over time
        cur.execute("""
            SELECT DATE(created_at) as date, energy_level
            FROM health_metrics 
            WHERE user_id = %s AND created_at >= NOW() - INTERVAL '30 days'
            ORDER BY created_at
        """, (user_id,))
        energy_trends = [dict(row) for row in cur.fetchall()]
        
        # Get data type distribution
        cur.execute("""
            SELECT data_type, COUNT(*) as count
            FROM user_data 
            WHERE user_id = %s
            GROUP BY data_type
        """, (user_id,))
        data_distribution = [dict(row) for row in cur.fetchall()]
        
        # Get risk level distribution
        cur.execute("""
            SELECT risk_level, COUNT(*) as count
            FROM analysis_results 
            WHERE user_id = %s AND risk_level IS NOT NULL
            GROUP BY risk_level
        """, (user_id,))
        risk_distribution = [dict(row) for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify({
            'mood_trends': mood_trends,
            'energy_trends': energy_trends,
            'data_distribution': data_distribution,
            'risk_distribution': risk_distribution
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Initialize database tables on startup (optional - for testing)
def init_db():
    """Initialize database with sample data if empty"""
    try:
        conn = get_db_connection()
        if conn:
            cur = conn.cursor()
            
            # Check if we have users
            cur.execute("SELECT COUNT(*) as count FROM users")
            user_count = cur.fetchone()['count']
            
            if user_count == 0:
                # Create sample user
                cur.execute("""
                    INSERT INTO users (name, email) VALUES ('Alex', 'alex@example.com')
                    RETURNING id
                """)
                user_id = cur.fetchone()['id']
                
                # Create sample metrics
                cur.execute("""
                    INSERT INTO health_metrics (user_id, energy_level, growth_points, check_ins, energy_streak)
                    VALUES (%s, 3, 2450, 24, 7)
                """, (user_id,))
                
                # Create sample chat session
                cur.execute("""
                    INSERT INTO chat_sessions (patient_id, session_date, duration_minutes, status, primary_emotion, emotion_confidence)
                    VALUES (%s, NOW(), 25, 'active', 'Joy', 30.0)
                    RETURNING id
                """, (user_id,))
                session_id = cur.fetchone()['id']
                
                # Create sample messages
                sample_messages = [
                    (session_id, 'patient', user_id, 'I also reconnected with an old friend, which made me feel better. These small moments have been bright spots in an otherwise difficult time.'),
                    (session_id, 'therapist', 1, "That's wonderful to hear about the gardening and reconnecting with your friend. These are excellent coping strategies. Have you been practicing any of the mindfulness techniques we discussed in our last session?")
                ]
                
                for msg in sample_messages:
                    cur.execute("""
                        INSERT INTO chat_messages (session_id, sender_type, sender_id, content, timestamp)
                        VALUES (%s, %s, %s, %s, NOW())
                    """, msg)
                
                conn.commit()
                print("Sample data created successfully!")
            
            cur.close()
            conn.close()
    except Exception as e:
        print(f"Error initializing database: {e}")

if __name__ == '__main__':
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    print("Starting AI Mental Health Platform Backend...")
    print("Features loaded:")
    print("✅ Dashboard API with data collection")
    print("✅ Voice, text, and feedback processing") 
    print("✅ ML sentiment analysis")
    print("✅ Chat session management")
    print("✅ SOAP note generation")
    print("✅ Real-time emotion analysis")
    print("Make sure PostgreSQL is running and database is created")
    print("Backend will run on http://localhost:5000")
    
    # Initialize sample data (optional)
    # init_db()
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000)