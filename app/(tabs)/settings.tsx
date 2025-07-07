import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  Moon, 
  Sun, 
  Bell, 
  User, 
  Shield, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Palette
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../services/authService';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              router.replace('/');
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          icon: isDark ? Moon : Sun,
          title: 'Theme',
          subtitle: isDark ? 'Dark mode' : 'Light mode',
          onPress: toggleTheme,
          showChevron: false,
        },
        {
          icon: Palette,
          title: 'Customize',
          subtitle: 'Colors and layout',
          onPress: () => {},
          showChevron: true,
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          title: 'Push Notifications',
          subtitle: 'Task reminders and updates',
          onPress: () => {},
          showChevron: true,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: User,
          title: 'Profile',
          subtitle: 'Manage your account',
          onPress: () => {},
          showChevron: true,
        },
        {
          icon: Shield,
          title: 'Privacy & Security',
          subtitle: 'Data and privacy settings',
          onPress: () => {},
          showChevron: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Help & Support',
          subtitle: 'FAQs and contact',
          onPress: () => {},
          showChevron: true,
        },
      ],
    },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: insets.top,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 20,
    },
    title: {
      fontSize: 28,
      fontFamily: 'Inter-Bold',
      color: theme.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    userCard: {
      backgroundColor: theme.surface,
      marginHorizontal: 24,
      marginBottom: 24,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    avatarText: {
      fontSize: 24,
      fontFamily: 'Inter-Bold',
      color: '#FFFFFF',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      paddingHorizontal: 24,
      marginBottom: 12,
    },
    settingItem: {
      backgroundColor: theme.surface,
      marginHorizontal: 24,
      marginBottom: 2,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
    },
    settingIcon: {
      marginRight: 16,
    },
    settingContent: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.text,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.textSecondary,
    },
    logoutButton: {
      backgroundColor: theme.error + '15',
      marginHorizontal: 24,
      marginTop: 24,
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.error,
      marginLeft: 8,
    },
  });

  const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your TodoFlow experience</Text>
      </View>

      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(user?.displayName, user?.email)}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user?.displayName || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <Pressable
                key={itemIndex}
                style={styles.settingItem}
                onPress={item.onPress}
              >
                <item.icon color={theme.primary} size={24} style={styles.settingIcon} />
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                {item.showChevron && (
                  <ChevronRight color={theme.textSecondary} size={20} />
                )}
              </Pressable>
            ))}
          </View>
        ))}

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color={theme.error} size={20} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}