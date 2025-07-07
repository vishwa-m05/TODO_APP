import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckSquare, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { theme } = useTheme();
  const { user, loading } = useAuth();

  const logoScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const floatingElements = useSharedValue(0);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/(tabs)');
      } else {
        // Start animations
        logoScale.value = withSpring(1, { damping: 15 });
        titleOpacity.value = withDelay(300, withSpring(1));
        buttonOpacity.value = withDelay(600, withSpring(1));
        floatingElements.value = withDelay(900, withSpring(1));
      }
    }
  }, [user, loading]);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = titleOpacity.value;
    return {
      opacity,
      transform: [{ translateY: (1 - opacity) * 30 }],
    };
  });

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = buttonOpacity.value;
    return {
      opacity,
      transform: [{ translateY: (1 - opacity) * 30 }],
    };
  });

  const floatingAnimatedStyle = useAnimatedStyle(() => {
    const opacity = floatingElements.value;
    return {
      opacity,
      transform: [{ translateY: (1 - opacity) * 50 }],
    };
  });

  const handleGetStarted = () => {
    router.push('/auth/login');
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    gradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    content: {
      alignItems: 'center',
      maxWidth: 320,
    },
    logoContainer: {
      marginBottom: 48,
      alignItems: 'center',
    },
    logoCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    title: {
      fontSize: 32,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 26,
      marginBottom: 48,
    },
    button: {
      backgroundColor: theme.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginRight: 8,
    },
    floatingElements: {
      position: 'absolute',
      top: 100,
      left: 50,
      right: 50,
      bottom: 200,
      pointerEvents: 'none',
    },
    floatingItem: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.accent + '30',
    },
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <CheckSquare color={theme.primary} size={48} />
        </View>
      </View>
    );
  }

  

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.background, theme.surface]}
        style={styles.gradient}
      >
        <Animated.View style={floatingAnimatedStyle}>
          <View style={styles.floatingElements}>
            <View style={[styles.floatingItem, { top: '10%', left: '20%' }]} />
            <View style={[styles.floatingItem, { top: '30%', right: '15%' }]} />
            <View style={[styles.floatingItem, { bottom: '20%', left: '10%' }]} />
          </View>
        </Animated.View>

        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoCircle}>
              <CheckSquare color="#FFFFFF" size={48} />
            </View>
          </Animated.View>

          <Animated.View style={titleAnimatedStyle}>
            <Text style={styles.title}>TodoFlow</Text>
            <Text style={styles.subtitle}>
              Organize your tasks, boost productivity, and achieve your goals with our intuitive todo app.
            </Text>
          </Animated.View>

          <Animated.View style={buttonAnimatedStyle}>
            <Pressable style={styles.button} onPress={handleGetStarted}>
              <Text style={styles.buttonText}>Get Started</Text>
              <ArrowRight color="#FFFFFF" size={20} />
            </Pressable>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
}
