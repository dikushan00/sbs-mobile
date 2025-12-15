import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useAudioPlayer, AudioSource } from 'expo-audio';
import { COLORS, FONT, SIZES } from '@/constants';
import { Icon } from '@/components/Icon';
import { useVoiceAssistant } from '@/utils/useVoiceAssistant';
import { useDispatch, useSelector } from 'react-redux';
import { setPageSettings } from '@/services/redux/reducers/app';
import { setPageHeaderData, userAppState } from '@/services/redux/reducers/userApp';

interface AIChatOrderScreenProps {
  onBack: () => void;
  projectId: number;
}

const API_KEYS = [
  '594f15b063d537943644ade1c59f2dd5eed9c3f9c6abea3e5dc9ed0540b104a8',
  'ddb551b08dcfc15f1a75f906f84acfe81662cd7fa8b31360e206dfb9a89621e2',
  '98096593aca9de78bacec1f02f2d60846451ff50070ddc7f024ed135d13eac49',
];

export const AIChatOrderScreen: React.FC<AIChatOrderScreenProps> = ({ onBack, projectId }) => {
  const dispatch = useDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const {userData} = useSelector(userAppState);
  const [selectedKeyIndex] = useState(1);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayer = useAudioPlayer();
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    timestamp: Date;
    audioUri?: string;
  }>>([
    {
      id: '1',
      role: 'assistant',
      text: 'Здравствуйте! Я помогу вам заказать материалы. Опишите, что вам нужно, или используйте голосовой ввод.',
      timestamp: new Date(),
    },
  ]);

  console.log("[VAC] chatMessages", chatMessages);
  const {
    isConnected,
    isRecording,
    messages,
    error,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    sendTextMessage,
  } = useVoiceAssistant({
    apiKey: API_KEYS[selectedKeyIndex],
    contractorId: userData?.contractor_id,
    employeeId: userData?.employee_id,
    projectId,
  });

  useEffect(() => {
    dispatch(setPageSettings({ 
      backBtn: true, 
      goBack: onBack
    }));
    dispatch(setPageHeaderData({
      title: 'AI Заказ материалов',
      desc: '',
    }));

    // Auto-connect on mount
    connect();

    return () => {
      disconnect();
    };
  }, [onBack]);

  // console.log("[VAC] messages", messages);
  // Handle new messages from server
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // console.log("[VAC] lastMessage", lastMessage);
      
      // Audio message from assistant
        // console.log("[VAC] lastMessage.audioUri", lastMessage);
      if (lastMessage.type === 'audio' && lastMessage.role === 'assistant' && lastMessage.audioUri) {
        addMessage('assistant', '🔊 Голосовое сообщение', lastMessage.audioUri);
      }
      // Text transcript from assistant
      else if (lastMessage.type === 'transcript' && lastMessage.role === 'assistant' && lastMessage.text) {
        addMessage('assistant', lastMessage.text);
      } 
      // Text transcript from user
      else if (lastMessage.type === 'transcript' && lastMessage.role === 'user' && lastMessage.text) {
        addMessage('user', lastMessage.text);
      }
      // Material matched
      else if (lastMessage.type === 'material_matched' && lastMessage.data) {
        const materialInfo = `Найден материал: ${lastMessage.data.material_name}\nЦена: ${lastMessage.data.price || 'уточняется'}`;
        addMessage('assistant', materialInfo);
      } 
      // Error
      else if (lastMessage.type === 'error' && lastMessage.error) {
        addMessage('system', `Ошибка: ${lastMessage.error.message}`);
      }
    }
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant' | 'system', text: string, audioUri?: string) => {
    const newMessage = {
      id: Date.now().toString(),
      role,
      text,
      timestamp: new Date(),
      audioUri,
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendText = () => {
    if (inputText.trim() === '') return;
    
    if (!isConnected) {
      addMessage('system', 'Подключение к серверу...');
      connect();
      return;
    }

    // Add user message to chat
    addMessage('user', inputText);
    
    // Send to server
    sendTextMessage(inputText);
    
    setInputText('');
  };

  const handleVoiceRecord = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const playAudio = async (messageId: string, uri: string) => {
    try {
      // If same audio is playing, stop it
      if (playingAudioId === messageId) {
        audioPlayer.pause();
        setPlayingAudioId(null);
        return;
      }

      // Stop current audio and play new one
      if (audioPlayer.playing) {
        audioPlayer.pause();
      }

      // Play new audio
      audioPlayer.replace({ uri } as AudioSource);
      audioPlayer.play();
      setPlayingAudioId(messageId);
    } catch (error) {
      console.error('Error playing audio:', error);
      addMessage('system', 'Ошибка воспроизведения аудио');
    }
  };

  // Track audio playback status
  useEffect(() => {
    if (!audioPlayer.playing && playingAudioId) {
      setPlayingAudioId(null);
    }
  }, [audioPlayer.playing, playingAudioId]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayer.playing) {
        audioPlayer.pause();
      }
    };
  }, []);

  const renderMessage = (message: typeof chatMessages[0]) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const isPlaying = playingAudioId === message.id;

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : isSystem ? styles.systemMessage : styles.assistantMessage,
        ]}
      >
        {!isUser && !isSystem && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
        )}
        <View style={styles.messageContent}>
          <View style={[
            styles.messageBubble,
            isUser ? styles.userMessageText : isSystem ? styles.systemMessageText : styles.assistantMessageText,
          ]}>
            {message.audioUri ? (
              <TouchableOpacity
                style={styles.audioPlayer}
                onPress={() => playAudio(message.id, message.audioUri!)}
              >
                <View style={[
                  styles.playButton,
                  isUser && styles.playButtonUser,
                ]}>
                  {isPlaying ? (
                    <View style={styles.pauseIcon}>
                      <View style={[styles.pauseBar, isUser && styles.pauseBarUser]} />
                      <View style={[styles.pauseBar, isUser && styles.pauseBarUser]} />
                    </View>
                  ) : (
                    <View style={[styles.playIcon, isUser && styles.playIconUser]} />
                  )}
                </View>
                <Text style={[
                  styles.audioText,
                  isUser ? styles.audioTextUser : styles.audioTextAssistant,
                ]}>
                  {message.text}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={[
                styles.messageTextContent,
                isUser && styles.messageTextContentUser,
                isSystem && styles.messageTextContentSystem,
              ]}>
                {message.text}
              </Text>
            )}
          </View>
          <Text style={[
            styles.messageTime,
            isUser ? styles.userMessageTime : styles.assistantMessageTime,
          ]}>
            {message.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  console.log(chatMessages?.map(item => !!item.audioUri));
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Connection Status */}
      {!isConnected && (
        <View style={styles.statusBar}>
          <ActivityIndicator size="small" color={COLORS.white} />
          <Text style={styles.statusText}>Подключение...</Text>
        </View>
      )}

      {error && (
        <View style={[styles.statusBar, styles.errorBar]}>
          <Text style={styles.statusText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.map(renderMessage)}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        {/* <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Введите сообщение..."
            placeholderTextColor={COLORS.gray}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendText}
            disabled={inputText.trim() === ''}
          >
            <Icon name="arrowRight" width={20} height={20} fill={inputText.trim() ? COLORS.primary : COLORS.gray} />
          </TouchableOpacity>
        </View> */}
        
        <TouchableOpacity
          style={[
            styles.voiceButton,
            isRecording && styles.voiceButtonActive,
          ]}
          onPress={handleVoiceRecord}
        >
          {isRecording ? (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
            </View>
          ) : (
            <Icon name="microphone" width={24} height={24} fill={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statusBar: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorBar: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontFamily: FONT.regular,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  systemMessage: {
    alignSelf: 'center',
    maxWidth: '90%',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 12,
    fontFamily: FONT.medium,
  },
  messageContent: {
    flex: 1,
  },
  messageBubble: {
    // Container for message content
  },
  messageText: {
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    lineHeight: 20,
  },
  messageTextContent: {
    color: COLORS.black,
  },
  messageTextContentUser: {
    color: COLORS.white,
  },
  messageTextContentSystem: {
    color: COLORS.gray,
    fontSize: SIZES.small,
    textAlign: 'center',
  },
  userMessageText: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  assistantMessageText: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  systemMessageText: {
    backgroundColor: COLORS.grayLight,
    padding: 8,
    borderRadius: 12,
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 200,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonUser: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  playIcon: {
    width: 0,
    height: 0,
    marginLeft: 3,
    borderLeftWidth: 12,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: COLORS.white,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  playIconUser: {
    borderLeftColor: COLORS.white,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 4,
    height: 16,
    backgroundColor: COLORS.white,
    borderRadius: 2,
  },
  pauseBarUser: {
    backgroundColor: COLORS.white,
  },
  audioText: {
    flex: 1,
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
  },
  audioTextUser: {
    color: COLORS.white,
  },
  audioTextAssistant: {
    color: COLORS.black,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: FONT.regular,
    marginTop: 4,
  },
  userMessageTime: {
    color: COLORS.gray,
    textAlign: 'right',
  },
  assistantMessageTime: {
    color: COLORS.gray,
    textAlign: 'left',
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: SIZES.regular,
    fontFamily: FONT.regular,
    color: COLORS.black,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: '#ef4444',
  },
  recordingIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
  },
});

