import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

/**
 * Hook для обработки deep links в приложении
 * 
 * Поддерживаемые форматы URL:
 * - sbs://login
 * - sbs://register
 * - sbs://forget-password
 * - sbs://profile
 * - sbs://notifications
 * - sbs://okk
 * - sbs://okk/:id
 * - https://sbs-m.smartremont.kz/login
 * - https://sbs-m.smartremont.kz/okk/:id
 */
export const useDeepLinking = () => {
  const navigation = useNavigation();

  const handleDeepLink = (url: string | null) => {
    if (!url) return;

    try {
      const { hostname, path, queryParams } = Linking.parse(url);
      
      // Определяем маршрут из пути
      const route = path || hostname || '';
      
      console.log('Deep link received:', { url, hostname, path, queryParams, route });

      // Навигация по маршрутам
      switch (route) {
        case 'login':
          navigation.navigate('login' as never);
          break;
          
        case 'register':
          navigation.navigate('register' as never);
          break;
          
        case 'forget-password':
          navigation.navigate('forget-password' as never);
          break;
          
        case 'profile':
          navigation.navigate('profile' as never);
          break;
          
        case 'notifications':
          navigation.navigate('notifications' as never);
          break;
          
        case 'okk':
          if (queryParams?.id) {
            // Если есть ID в параметрах, переходим к конкретному OKK
            navigation.navigate('okk/index' as never, { id: queryParams.id } as never);
          } else {
            navigation.navigate('okk/index' as never);
          }
          break;

        default:
          // Если маршрут содержит okk/ с ID в пути
          if (route.startsWith('okk/')) {
            const id = route.split('/')[1];
            if (id) {
              navigation.navigate('okk/index' as never, { id } as never);
            }
          } else if (route) {
            console.log('Unknown deep link route:', route);
          }
          break;
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };

  useEffect(() => {
    // Обработка initial URL (когда приложение открывается по ссылке)
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    getInitialURL();

    // Обработка URL когда приложение уже открыто
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return { handleDeepLink };
};

