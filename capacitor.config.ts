
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.391b2d489d9b48e6a563c650bebfc859',
  appName: 'tasklight-harmony',
  webDir: 'dist',
  server: {
    url: 'https://391b2d48-9d9b-48e6-a563-c650bebfc859.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#8ec5fc",
      sound: "notification.mp3",
    }
  }
};

export default config;
