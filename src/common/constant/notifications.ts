export interface NotificationMessage {
  title: string;
  body: string;
}

export const notifications = {
  welcome_message: {
    ar: { title: 'اهلا بك!', body: 'شكرا لانضمامك معنا .' },
    en: { title: 'Welcome!', body: 'Thank you for joining us.' },
    fr: { title: 'Bienvenue !', body: 'Merci de nous rejoindre.' },
    de: { title: 'Willkommen!', body: 'Danke, dass du beigetreten bist.' },
  },
  update_available: {
    ar: { title: 'متوفر تحديث', body: 'نسخة جديدة متاحة للتنزيل الأن' },
    en: { title: 'Update Available', body: 'A new version is ready.' },
    fr: {
      title: 'Mise à jour disponible',
      body: 'Une nouvelle version est prête.',
    },
    de: {
      title: 'Aktualisierung verfügbar',
      body: 'Eine neue Version ist bereit.',
    },
  },
};

export type NotificationCode = keyof typeof notifications;

export function getNotification(
  code: NotificationCode,
  lang: string = 'en',
  data: Record<string, any> = {},
): NotificationMessage {
  const message = notifications[code][lang] || notifications[code]['en'];

  const replacePlaceholders = (text: string): string => {
    return text.replace(/{(\w+)}/g, (_, key) => {
      return data[key] !== undefined ? data[key] : `{${key}}`;
    });
  };

  return {
    title: replacePlaceholders(message.title),
    body: replacePlaceholders(message.body),
  };
}
