import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

import { Theme } from '../../constants/theme';
import { RootState } from '../../store';

export default function SettingsScreen() {
  const { settings } = useSelector((state: RootState) => state.settings);

  const settingSections = [
    {
      title: 'Notifications',
      items: [
        {
          id: 'notifications-enabled',
          title: 'Enable Notifications',
          subtitle: 'Receive reminders and insights',
          type: 'switch',
          value: settings?.notifications?.enabled || false,
          onPress: () => console.log('Toggle notifications'),
        },
        {
          id: 'reminders',
          title: 'Daily Reminders',
          subtitle: 'Get reminded to log your health data',
          type: 'switch',
          value: settings?.notifications?.reminders || false,
          onPress: () => console.log('Toggle reminders'),
        },
        {
          id: 'insights',
          title: 'Insight Notifications',
          subtitle: 'Get notified about new health insights',
          type: 'switch',
          value: settings?.notifications?.insights || false,
          onPress: () => console.log('Toggle insights'),
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          id: 'data-sharing',
          title: 'Data Sharing',
          subtitle: 'Allow anonymous data sharing for research',
          type: 'switch',
          value: settings?.privacy?.dataSharing || false,
          onPress: () => console.log('Toggle data sharing'),
        },
        {
          id: 'analytics',
          title: 'Analytics',
          subtitle: 'Help improve the app with usage analytics',
          type: 'switch',
          value: settings?.privacy?.analytics || false,
          onPress: () => console.log('Toggle analytics'),
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          title: 'Theme',
          subtitle: settings?.theme === 'dark' ? 'Dark' : settings?.theme === 'light' ? 'Light' : 'Auto',
          type: 'navigation',
          onPress: () => console.log('Change theme'),
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: 'English',
          type: 'navigation',
          onPress: () => console.log('Change language'),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          id: 'export',
          title: 'Export Data',
          subtitle: 'Download your health data',
          type: 'navigation',
          onPress: () => console.log('Export data'),
        },
        {
          id: 'import',
          title: 'Import Data',
          subtitle: 'Import data from other apps',
          type: 'navigation',
          onPress: () => console.log('Import data'),
        },
        {
          id: 'delete',
          title: 'Delete All Data',
          subtitle: 'Permanently delete all your data',
          type: 'navigation',
          onPress: () => console.log('Delete data'),
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    if (item.type === 'switch') {
      return (
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onPress}
            trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
            thumbColor={item.value ? Theme.colors.textInverse : Theme.colors.textTertiary}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.settingItem} onPress={item.onPress}>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Theme.colors.textTertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <View key={item.id}>
                {renderSettingItem(item)}
                {itemIndex < section.items.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Health Ecosystem v1.0.0</Text>
        <Text style={styles.footerText}>Built with React Native & Expo</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    padding: Theme.spacing.lg,
    paddingTop: Theme.spacing.xl,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.h6,
    color: Theme.colors.textPrimary,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  sectionContent: {
    backgroundColor: Theme.colors.surface,
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...Theme.typography.body1,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  settingSubtitle: {
    ...Theme.typography.body2,
    color: Theme.colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginLeft: Theme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  footerText: {
    ...Theme.typography.caption,
    color: Theme.colors.textTertiary,
    marginBottom: Theme.spacing.xs,
  },
});

