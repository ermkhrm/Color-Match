import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = ['red', 'blue', 'green', 'yellow'];

export default function App() {
  const [currentColor, setCurrentColor] = useState(COLORS[0]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(3);
  const [highestScore, setHighestScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [showInstructions, setShowInstructions] = useState(true);
  const fadeAnim = useState(new Animated.Value(1))[0];

  // Load highest score from AsyncStorage
  useEffect(() => {
    const loadHighestScore = async () => {
      const savedScore = await AsyncStorage.getItem('highestScore');
      if (savedScore) setHighestScore(parseInt(savedScore));
    };
    loadHighestScore();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      resetGame();
    }
  }, [timer]);

  // Handle button press
  const handlePress = (color) => {
    if (color === currentColor) {
      const newScore = score + 1;
      setScore(newScore);
      setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      setTimer(3); // Reset timer

      // Level up every 5 points, reduce timer difficulty
      if (newScore % 5 === 0) {
        setLevel(level + 1);
        setTimer(prev => Math.max(prev - 1, 1));
      }

      // Save highest score
      if (newScore > highestScore) {
        setHighestScore(newScore);
        AsyncStorage.setItem('highestScore', newScore.toString());
      }

      // Animate box
      fadeAnim.setValue(1);
      Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => fadeAnim.setValue(1));
    } else {
      resetGame();
    }
  };

  // Reset game
  const resetGame = () => {
    setScore(0);
    setTimer(3);
    setLevel(1);
    setCurrentColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
  };

  // Start game
  const handleStartGame = () => {
    setShowInstructions(false);
    setTimer(3);
    resetGame();
  };

  return (
    <LinearGradient colors={['#ff7e5f', '#feb47b']} style={styles.container}>
      {showInstructions ? (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsText}>🎮 Welcome to Color Match!</Text>
          <Text style={styles.instructionsText}>Tap the button that matches the color shown.</Text>
          <Text style={styles.instructionsText}>Correct = Score up ✅ | Wrong = Reset ❌</Text>
          <Text style={styles.instructionsText}>Levels increase every 5 points. Timer gets faster!</Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
            <Text style={styles.buttonText}>Start Game 🚀</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.score}>Score: {score}</Text>
          <Text style={styles.highScore}>🏆 High Score: {highestScore}</Text>
          <Text style={styles.level}>🔥 Level: {level}</Text>
          <Text style={styles.timer}>⏳ Time: {timer}s</Text>

          <Animated.View style={[styles.colorBox, { backgroundColor: currentColor, opacity: fadeAnim }]} />

          <View style={styles.buttonsContainer}>
            {COLORS.map(color => (
              <TouchableOpacity key={color} style={[styles.button, { backgroundColor: color }]} onPress={() => handlePress(color)}>
                <Text style={styles.buttonText}>{color.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  score: { color: 'white', fontSize: 24, marginBottom: 5 },
  highScore: { color: 'white', fontSize: 18, marginBottom: 5 },
  level: { color: 'white', fontSize: 18, marginBottom: 5 },
  timer: { color: 'white', fontSize: 18, marginBottom: 20 },
  colorBox: { width: 150, height: 150, borderRadius: 10, marginBottom: 20 },
  buttonsContainer: { flexDirection: 'row', gap: 10, marginBottom: 50 },
  button: { padding: 15, borderRadius: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 },
  buttonText: { color: 'white', fontWeight: 'bold', textAlign: 'center' },
  instructionsContainer: { padding: 20, alignItems: 'center' },
  instructionsText: { color: 'white', fontSize: 18, textAlign: 'center', marginBottom: 10 },
  startButton: { backgroundColor: '#444', padding: 15, borderRadius: 5, marginTop: 20 },
});

