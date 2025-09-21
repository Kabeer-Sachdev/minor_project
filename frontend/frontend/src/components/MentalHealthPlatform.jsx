import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Star, 
  Calendar, 
  TrendingUp, 
  Mic, 
  MessageSquare, 
  Users,
  Phone,
  Upload,
  Play,
  Pause,
  RefreshCw,
  Send,
  Camera
} from 'lucide-react';

const MentalHealthDashboard = () => {
  // State management
  const [userData, setUserData] = useState({
    user: { id: 1, name: 'Alex' },
    metrics: {
      energy_level: 3,
      growth_points: 2450,
      check_ins: 24,
      energy_streak: 7,
      mood_score: 0.75
    },
    garden_status: {
      current_flower: 'Resilience Rose',
      bloom_progress: 68,
      message: 'Your garden is blooming beautifully!'
    }
  });

  // Form states
  const [selectedEnergy, setSelectedEnergy] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [textMessage, setTextMessage] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [phoneCallText, setPhoneCallText] = useState('');
  const [socialMediaPost, setSocialMediaPost] = useState('');
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Function to open chat session in new window
  const openChatSession = () => {
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      '/therapist-chat',
      'TherapistChatSession',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };
  
  // UI states
  const [activeTab, setActiveTab] = useState('data-collection');
  const [notifications, setNotifications] = useState([]);

  // Energy level options with emojis
  const energyLevels = [
    { level: 1, emoji: '😴', label: 'Struggling', color: 'bg-red-100 text-red-600' },
    { level: 2, emoji: '😞', label: 'Low Energy', color: 'bg-orange-100 text-orange-600' },
    { level: 3, emoji: '😐', label: 'Balanced', color: 'bg-yellow-100 text-yellow-600' },
    { level: 4, emoji: '😊', label: 'Peaceful', color: 'bg-blue-100 text-blue-600' },
    { level: 5, emoji: '🤩', label: 'Energized', color: 'bg-green-100 text-green-600' }
  ];

  // Power-up activities
  const powerUps = [
    {
      id: 'breathing',
      title: 'Breathing Space',
      description: '5-minute guided breathing exercise',
      points: 15,
      icon: Heart,
      color: 'bg-pink-500'
    },
    {
      id: 'gratitude',
      title: 'Gratitude Boost',
      description: 'Quick gratitude journaling prompt',
      points: 20,
      icon: Star,
      color: 'bg-yellow-500'
    },
    {
      id: 'connection',
      title: 'Connection Circle',
      description: 'Send encouragement to a friend',
      points: 25,
      icon: Users,
      color: 'bg-green-500'
    }
  ];

  // Add notification
  const addNotification = (message, type = 'success') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, notification]);
    
    // Remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/1/dashboard');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setSelectedEnergy(data.metrics.energy_level);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      addNotification('Failed to load dashboard data', 'error');
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update energy level
  const updateEnergyLevel = async (level) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/1/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energy_level: level })
      });
      
      if (response.ok) {
        const result = await response.json();
        setSelectedEnergy(level);
        await loadDashboardData();
        addNotification('Energy level updated! +' + result.points_earned + ' points earned');
      }
    } catch (error) {
      console.error('Error updating energy:', error);
      addNotification('Failed to update energy level', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit text message
  const submitTextMessage = async () => {
    if (!textMessage.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/text-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          message: textMessage,
          type: 'manual_input'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setTextMessage('');
        await loadDashboardData();
        addNotification('Text analyzed! Emotion: ' + result.analysis.emotion + ', Risk: ' + result.risk_level);
      }
    } catch (error) {
      console.error('Error submitting text:', error);
      addNotification('Failed to process text message', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit phone call data
  const submitPhoneCallData = async () => {
    if (!phoneCallText.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/text-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          message: phoneCallText,
          type: 'phone_call'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setPhoneCallText('');
        await loadDashboardData();
        addNotification('Phone call analyzed! Sentiment: ' + result.analysis.emotion);
      }
    } catch (error) {
      console.error('Error submitting phone call:', error);
      addNotification('Failed to process phone call data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit social media post
  const submitSocialMediaPost = async () => {
    if (!socialMediaPost.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/text-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          message: socialMediaPost,
          type: 'social_media'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setSocialMediaPost('');
        await loadDashboardData();
        addNotification('Social media post analyzed! Emotion: ' + result.analysis.emotion);
      }
    } catch (error) {
      console.error('Error submitting social media post:', error);
      addNotification('Failed to process social media post', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Submit family feedback
  const submitFeedback = async () => {
    if (!feedbackText.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/family-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          feedback: feedbackText,
          relationship: 'family'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setFeedbackText('');
        await loadDashboardData();
        addNotification('Feedback processed! Risk Level: ' + result.risk_level + ', +' + result.points_earned + ' points');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      addNotification('Failed to process feedback', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordingBlob(blob);
        setRecordingDuration(0);
      };

      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);

      // Auto stop after 60 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 60000);
    } catch (error) {
      console.error('Error starting recording:', error);
      addNotification('Microphone access denied or not available', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const uploadVoiceRecording = async () => {
    if (!recordingBlob) return;
    
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('voice_file', recordingBlob, 'voice_message.wav');
      formData.append('user_id', '1');

      const response = await fetch('http://localhost:5000/api/voice-message', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        setRecordingBlob(null);
        await loadDashboardData();
        addNotification('Voice processed! Emotion: ' + result.analysis.emotion + ', +' + result.points_earned + ' points');
      }
    } catch (error) {
      console.error('Error uploading voice:', error);
      addNotification('Failed to process voice recording', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock data for testing
  const generateMockData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-mock-data/1', {
        method: 'POST'
      });
      
      if (response.ok) {
        const result = await response.json();
        await loadDashboardData();
        addNotification('Mock data generated! ' + result.data_points + ' data points processed');
      }
    } catch (error) {
      console.error('Error generating mock data:', error);
      addNotification('Failed to generate mock data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete power-up activity
  const completePowerUp = async (activityId, points) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/1/powerups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_type: activityId })
      });
      
      if (response.ok) {
        await loadDashboardData();
        addNotification(activityId + ' completed! +' + points + ' points earned');
      }
    } catch (error) {
      console.error('Error completing power-up:', error);
      addNotification('Failed to complete power-up', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins + ':' + secs.toString().padStart(2, '0');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Notifications */}
        <div className="fixed top-4 right-4 space-y-2 z-50">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={'p-4 rounded-lg shadow-lg max-w-sm ' + 
                (notification.type === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-red-500 text-white'
                )}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs opacity-80">
                {notification.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {userData.user.name}! ✨
          </h1>
          <p className="text-gray-600">Your journey of growth continues today</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('data-collection')}
              className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' + 
                (activeTab === 'data-collection'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                )}
            >
              Data Collection
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={'px-4 py-2 rounded-md text-sm font-medium transition-colors ' +
                (activeTab === 'dashboard'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                )}
            >
              Dashboard
            </button>
          </div>
        </div>

        {/* Data Collection Tab */}
        {activeTab === 'data-collection' && (
          <div className="space-y-8">
            {/* Data Collection Panel */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Data Collection Sources</h3>
                <button
                  onClick={generateMockData}
                  disabled={isLoading}
                  className="flex items-center bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Test Data
                </button>
              </div>

              {/* Data Sources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Voice Messages */}
                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-purple-100 rounded-full mr-3">
                      <Mic className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Voice Messages</h4>
                      <p className="text-sm text-gray-600">Record your thoughts</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {!isRecording && !recordingBlob && (
                      <button
                        onClick={startRecording}
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 disabled:opacity-50 flex items-center justify-center"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Recording
                      </button>
                    )}
                    
                    {isRecording && (
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className="text-2xl text-red-500 mb-2">🔴</div>
                          <p className="text-sm font-medium">Recording...</p>
                        </div>
                        <button
                          onClick={stopRecording}
                          className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center"
                        >
                          <Pause className="w-4 h-4 mr-2" />
                          Stop Recording
                        </button>
                      </div>
                    )}
                    
                    {recordingBlob && (
                      <div className="space-y-2">
                        <div className="text-center p-2 bg-green-100 rounded">
                          <p className="text-sm text-green-700">Recording ready!</p>
                        </div>
                        <button
                          onClick={uploadVoiceRecording}
                          disabled={isLoading}
                          className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload & Analyze
                        </button>
                        <button
                          onClick={() => setRecordingBlob(null)}
                          className="w-full py-1 px-4 text-gray-500 text-sm hover:text-gray-700"
                        >
                          Discard
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text Messages */}
                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-blue-100 rounded-full mr-3">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Text Messages</h4>
                      <p className="text-sm text-gray-600">Share your thoughts</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={textMessage}
                      onChange={(e) => setTextMessage(e.target.value)}
                      placeholder="How are you feeling today? What's on your mind?"
                      className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                    />
                    <button
                      onClick={submitTextMessage}
                      disabled={isLoading || !textMessage.trim()}
                      className="w-full py-2 px-4 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Analyze Text
                    </button>
                  </div>
                </div>

                {/* Phone Conversations */}
                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-green-100 rounded-full mr-3">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Phone Calls</h4>
                      <p className="text-sm text-gray-600">Log conversations</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={phoneCallText}
                      onChange={(e) => setPhoneCallText(e.target.value)}
                      placeholder="Describe your recent phone conversation or important call..."
                      className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                    />
                    <button
                      onClick={submitPhoneCallData}
                      disabled={isLoading || !phoneCallText.trim()}
                      className="w-full py-2 px-4 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Log Call Data
                    </button>
                  </div>
                </div>

                {/* Social Media */}
                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-pink-100 rounded-full mr-3">
                      <Camera className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Social Media</h4>
                      <p className="text-sm text-gray-600">Analyze posts</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={socialMediaPost}
                      onChange={(e) => setSocialMediaPost(e.target.value)}
                      placeholder="Paste your social media post or describe your online interactions..."
                      className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      rows="3"
                    />
                    <button
                      onClick={submitSocialMediaPost}
                      disabled={isLoading || !socialMediaPost.trim()}
                      className="w-full py-2 px-4 bg-pink-100 text-pink-600 rounded-lg hover:bg-pink-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Analyze Post
                    </button>
                  </div>
                </div>

                {/* Family Feedback */}
                <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-orange-100 rounded-full mr-3">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">Family Feedback</h4>
                      <p className="text-sm text-gray-600">External observations</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="What have your family or friends observed about your mood or behavior?"
                      className="w-full p-3 border rounded-lg text-sm resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows="3"
                    />
                    <button
                      onClick={submitFeedback}
                      disabled={isLoading || !feedbackText.trim()}
                      className="w-full py-2 px-4 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Submit Feedback
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Energy Streak */}
              <div className="bg-green-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-medium mb-1">Energy Streak</p>
                    <p className="text-3xl font-bold text-green-900">
                      {userData.metrics.energy_streak} days
                    </p>
                  </div>
                  <div className="bg-green-200 p-3 rounded-full">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Growth Points */}
              <div className="bg-pink-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-pink-800 font-medium mb-1">Growth Points</p>
                    <p className="text-3xl font-bold text-pink-900">
                      {userData.metrics.growth_points.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-pink-200 p-3 rounded-full">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                </div>
              </div>

              {/* Check-ins */}
              <div className="bg-blue-100 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-medium mb-1">Check-ins</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {userData.metrics.check_ins}
                    </p>
                  </div>
                  <div className="bg-blue-200 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Chat Session Button */}
              <div className="bg-green-100 rounded-2xl p-6 relative overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300" onClick={openChatSession}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-800 font-medium mb-1">Start a Chat Session</p>
                    <p className="text-sm text-green-700">Talk to your therapist in a new window</p>
                  </div>
                  <div className="bg-green-200 p-3 rounded-full">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Energy Level Selector */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-xl mb-6">
                  <h3 className="text-xl font-bold">How's your energy today?</h3>
                </div>
                
                <div className="grid grid-cols-5 gap-3">
                  {energyLevels.map((energy) => (
                    <button
                      key={energy.level}
                      onClick={() => updateEnergyLevel(energy.level)}
                      disabled={isLoading}
                      className={
                        'p-4 rounded-xl text-center transition-all duration-200 border-2 ' +
                        (selectedEnergy === energy.level 
                          ? 'border-purple-500 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-purple-300'
                        ) + ' ' +
                        energy.color + ' ' +
                        (isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer')
                      }
                    >
                      <div className="text-3xl mb-2">{energy.emoji}</div>
                      <div className="text-xs font-medium">{energy.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Growth Garden */}
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl mb-6">
                  <h3 className="text-xl font-bold">Your Growth Garden</h3>
                </div>
                
                <div className="text-center">
                  <div className="text-6xl mb-4">🌸</div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {userData.garden_status.current_flower}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {userData.garden_status.message}
                  </p>
                  
                  <div className="bg-gray-200 rounded-full h-3 mb-4">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: userData.garden_status.bloom_progress + '%' }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {userData.garden_status.bloom_progress}% to next bloom stage
                  </p>
                  
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700">
                      "Every small step you take helps your garden grow. You're doing amazing! 🌱"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Power-ups Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center mb-6">
                <TrendingUp className="w-6 h-6 text-purple-500 mr-3" />
                <h3 className="text-xl font-bold text-gray-800">Today's Power-Ups</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {powerUps.map((powerUp) => (
                  <div key={powerUp.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className={'p-3 rounded-full ' + powerUp.color}>
                        <powerUp.icon className="w-5 h-5 text-white" />
                      </div>
                      <button
                        onClick={() => completePowerUp(powerUp.id, powerUp.points)}
                        disabled={isLoading}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                      >
                        Start +{powerUp.points} points
                      </button>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2">{powerUp.title}</h4>
                    <p className="text-sm text-gray-600">{powerUp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Support Circle */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-xl mb-6">
                <div className="flex items-center">
                  <Users className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-bold">Your Support Circle</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-2">Community Check-In</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Share encouragement with peers who understand
                  </p>
                  <button className="flex items-center bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Join
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-2">Data Insights</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    View your mental health analytics and trends
                  </p>
                  <button 
                    onClick={loadDashboardData}
                    className="flex items-center bg-green-100 text-green-600 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing your data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentalHealthDashboard;