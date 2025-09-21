import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff,
  MoreVertical,
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Activity,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

const TherapistChatSession = () => {
  const [patientData] = useState({
    name: 'Simon Jones',
    age: 28,
    gender: 'Male',
    lastSession: '5 days ago',
    currentSession: '25 minutes',
    notes: 'Patient has been experiencing anxiety and mild depression. Previous session showed improvement in sleep pattern but continued worry about work-related stress.'
  });

  const [emotionHistory, setEmotionHistory] = useState([
    { time: '11:16 AM', type: 'Social Interactions', emotion: 'Neutral', percentage: 35, message: 'Large gatherings still make me nervous, but I managed to attend my friend\'s party last weekend.' }
  ]);

  const [currentEmotions, setCurrentEmotions] = useState({
    primary: { emotion: 'Joy', percentage: 30 },
    breakdown: [
      { emotion: 'Joy', percentage: 30, color: 'bg-green-500' },
      { emotion: 'Gratitude', percentage: 25, color: 'bg-pink-500' },
      { emotion: 'Pride', percentage: 20, color: 'bg-yellow-500' },
      { emotion: 'Neutral', percentage: 15, color: 'bg-gray-500' },
      { emotion: 'Sadness', percentage: 10, color: 'bg-blue-500' }
    ]
  });

  const [patientEmotions, setPatientEmotions] = useState({
    primary: { emotion: 'Neutral', percentage: 35 },
    breakdown: [
      { emotion: 'Neutral', percentage: 35, color: 'bg-gray-500' },
      { emotion: 'Joy', percentage: 20, color: 'bg-green-500' },
      { emotion: 'Sadness', percentage: 10, color: 'bg-blue-500' },
      { emotion: 'Anger', percentage: 5, color: 'bg-red-500' },
      { emotion: 'Fear', percentage: 5, color: 'bg-purple-500' },
      { emotion: 'Surprise', percentage: 5, color: 'bg-yellow-500' },
      { emotion: 'Disgust', percentage: 5, color: 'bg-green-600' },
      { emotion: 'Contempt', percentage: 5, color: 'bg-indigo-500' },
      { emotion: 'Gratitude', percentage: 5, color: 'bg-pink-500' },
      { emotion: 'Pride', percentage: 5, color: 'bg-orange-500' }
    ]
  });

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'patient',
      content: 'therapeutic I also reconnected with an old friend, which made me feel better. These small moments have been bright spots in an otherwise difficult time.',
      timestamp: new Date(),
      emotions: { primary: 'Joy', percentage: 30, breakdown: currentEmotions.breakdown }
    },
    {
      id: 2,
      type: 'therapist',
      content: 'That\'s wonderful to hear about the gardening and reconnecting with your friend. These are excellent coping strategies. Have you been practicing any of the mindfulness techniques we discussed in our last session?',
      timestamp: new Date(),
      sender: 'Dr. Thompson',
      time: '11:09 AM'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showEmotionHistory, setShowEmotionHistory] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: messages.length + 1,
      type: 'therapist',
      content: newMessage,
      timestamp: new Date(),
      sender: 'Dr. Thompson',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate patient response after 2 seconds
    setTimeout(() => {
      const responses = [
        'I\'ve been trying to practice the breathing exercises, but it\'s been challenging.',
        'Yes, the mindfulness techniques have been helpful, especially before bed.',
        'I find it difficult to stay consistent with the exercises.',
        'Thank you for your guidance. It really makes a difference.'
      ];
      
      const patientMessage = {
        id: messages.length + 2,
        type: 'patient',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        emotions: { 
          primary: patientEmotions.breakdown[Math.floor(Math.random() * 3)].emotion, 
          percentage: Math.floor(Math.random() * 40) + 20,
          breakdown: patientEmotions.breakdown
        }
      };

      setMessages(prev => [...prev, patientMessage]);
    }, 2000);
  };

  const toggleCall = () => {
    setIsCallActive(!isCallActive);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const generateSOAPNote = () => {
    const soapNote = `
SOAP NOTE - ${new Date().toLocaleDateString()}
Patient: ${patientData.name}
Session Duration: ${patientData.currentSession}

SUBJECTIVE:
Patient reports reconnecting with old friend and finding joy in small moments. Mentions continued challenges with anxiety in social situations but shows improvement in coping strategies.

OBJECTIVE:
Primary emotion detected: ${patientEmotions.primary.emotion} (${patientEmotions.primary.percentage}%)
Patient engaged actively in conversation, demonstrated good insight into emotional patterns.

ASSESSMENT:
Continued progress in anxiety management. Patient showing improved social connections and positive coping mechanisms.

PLAN:
1. Continue mindfulness practice
2. Encourage social activities
3. Schedule follow-up in 1 week
    `;
    
    alert('SOAP Note Generated:\n' + soapNote);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-12 gap-4 h-screen">
          
          {/* Left Sidebar - Patient Info */}
          <div className="col-span-3 space-y-4">
            {/* Patient Profile */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{patientData.name}</h3>
                  <p className="text-gray-400 text-sm">{patientData.age} yrs • {patientData.gender}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>Last session: {patientData.lastSession}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span>Current session: {patientData.currentSession}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <p className="text-xs text-gray-300">{patientData.notes}</p>
              </div>
            </div>

            {/* Topic-Emotion Analysis */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Topic-Emotion Analysis</h4>
                <ChevronUp className="w-5 h-5" />
              </div>
              
              {emotionHistory.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="bg-purple-600 rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Social Interactions</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-xs">😐</span>
                    </div>
                    <span className="text-sm">Neutral</span>
                    <span className="text-sm text-gray-400">{item.percentage}%</span>
                  </div>
                  
                  <p className="text-xs text-gray-300 italic">"{item.message}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Center - Chat Session */}
          <div className="col-span-6 bg-gray-800 rounded-lg flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <ArrowLeft className="w-5 h-5 cursor-pointer hover:text-purple-400" />
                <h2 className="text-xl font-semibold">Chat Session</h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">{new Date().toLocaleDateString()}</span>
                <button 
                  onClick={toggleCall}
                  className={`p-2 rounded-lg ${isCallActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {isCallActive ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                </button>
                <button 
                  onClick={toggleMute}
                  className={`p-2 rounded-lg ${isMuted ? 'bg-red-600' : 'bg-gray-600 hover:bg-gray-700'}`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'therapist' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-lg ${message.type === 'patient' ? 'bg-purple-600' : 'bg-gray-700'} rounded-lg p-4`}>
                    <p className="text-sm mb-2">{message.content}</p>
                    
                    {message.emotions && (
                      <div className="mt-3 p-2 bg-gray-800 rounded">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-xs">😊</span>
                          <span className="text-xs">Primary emotion detected in response</span>
                          <span className="text-xs font-semibold">{message.emotions.percentage}%</span>
                        </div>
                        
                        <div className="text-xs text-gray-300 mb-2">Emotion Breakdown</div>
                        <div className="space-y-1">
                          {message.emotions.breakdown.slice(0, 5).map((emotion, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs">😊</span>
                                <span className="text-xs">{emotion.emotion}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 h-1 bg-gray-600 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${emotion.color}`}
                                    style={{ width: `${emotion.percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400">{emotion.percentage}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {message.type === 'therapist' && (
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                        <span>{message.sender}</span>
                        <span>{message.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button 
                  onClick={sendMessage}
                  className="bg-purple-600 hover:bg-purple-700 rounded-lg p-2"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Emotion History Section */}
            <div className="border-t border-gray-700">
              <button 
                onClick={() => setShowEmotionHistory(!showEmotionHistory)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-700"
              >
                <span className="font-semibold">Emotion History</span>
                {showEmotionHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showEmotionHistory && (
                <div className="p-4 bg-gray-700">
                  <div className="text-sm text-gray-400 mb-2">Session Emotion Timeline</div>
                  <div className="space-y-2">
                    {messages.filter(m => m.emotions).map((message, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span>{message.emotions.primary}</span>
                        <span>{message.emotions.percentage}%</span>
                        <span className="text-gray-400">{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI SOAP Note */}
            <div className="border-t border-gray-700">
              <div className="p-4 flex items-center justify-between">
                <span className="font-semibold">AI MedScribe - SOAP Note</span>
                <button 
                  onClick={generateSOAPNote}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Regenerate</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Patient's Emotional State */}
          <div className="col-span-3 bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">Patient's Emotional State</h4>
              <ChevronUp className="w-5 h-5" />
            </div>

            <div className="text-center mb-6">
              <div className="text-6xl mb-2">😐</div>
              <div className="text-sm text-gray-400 mb-1">Primary emotion detected in response</div>
              <div className="text-2xl font-bold">{patientEmotions.primary.percentage}%</div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-400 mb-2">Emotion Breakdown</div>
              {patientEmotions.breakdown.map((emotion, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${emotion.color}`}></div>
                    <span className="text-sm">{emotion.emotion}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${emotion.color}`}
                        style={{ width: `${emotion.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-400 w-8">{emotion.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Real-time Indicators */}
            {isCallActive && (
              <div className="mt-6 p-3 bg-green-900 rounded-lg">
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live call in progress</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">Real-time emotion analysis active</div>
              </div>
            )}
            
            {isMuted && (
              <div className="mt-2 p-2 bg-red-900 rounded text-red-400 text-sm">
                <span>Microphone muted</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistChatSession;