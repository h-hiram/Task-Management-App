
import { LocalNotifications } from '@capacitor/local-notifications';

class NotificationService {
  private static instance: NotificationService;
  private isCapacitor = false;
  private notificationSound: HTMLAudioElement;

  private constructor() {
    this.notificationSound = new Audio('/notification.mp3');
    this.isCapacitor = typeof window !== 'undefined' && 
                       window.Capacitor !== undefined && 
                       window.Capacitor.isNativePlatform();
    
    if (this.isCapacitor) {
      this.setupCapacitorNotifications();
    }
    
    // Preload the notification sound for faster response
    this.notificationSound.preload = 'auto';
    this.notificationSound.load();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async setupCapacitorNotifications() {
    try {
      // Request permission
      await LocalNotifications.requestPermissions();
    } catch (error) {
      console.error('Error setting up Capacitor notifications:', error);
    }
  }

  public async sendNotification(title: string, body: string, id: number = Date.now()): Promise<void> {
    try {
      // Play sound on both web and native immediately
      this.playSound();

      if (this.isCapacitor) {
        // Send native notification
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id,
              sound: 'notification.mp3',
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#8ec5fc',
            },
          ],
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        // Send web notification
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  public async requestPermission(): Promise<boolean> {
    try {
      if (this.isCapacitor) {
        const permission = await LocalNotifications.requestPermissions();
        return permission.display === 'granted';
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  public playSound(): void {
    try {
      // Reset sound to beginning to ensure it plays
      this.notificationSound.currentTime = 0;
      
      // Play immediately without waiting
      const playPromise = this.notificationSound.play();
      
      // Handle any errors with playing
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error("Could not play notification sound:", err);
          // If autoplay is blocked, try again after user interaction
          document.addEventListener('click', () => {
            this.notificationSound.play().catch(e => console.error("Still couldn't play sound:", e));
          }, { once: true });
        });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }
}

export default NotificationService;
