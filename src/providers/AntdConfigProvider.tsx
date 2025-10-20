import { ConfigProvider, theme } from 'antd';
import { useTheme } from '../contexts/ThemeContext';

export function AntdConfigProvider({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme } = useTheme();

  const isDark = currentTheme === 'dark';

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorText: isDark ? '#ffffff' : '#1e293b',
          colorTextHeading: isDark ? '#ffffff' : '#288592',
          colorTextSecondary: isDark ? '#83d9dd' : '#288592',
          colorTextTertiary: isDark ? '#3ab7bf' : '#266c78',
          colorTextQuaternary: isDark ? '#2da3ad' : '#275963',

          // Colores de fondo
          colorBgContainer: isDark ? '#254a54' : '#ffffff',
          colorBgElevated: isDark ? '#275963' : '#f0fbfa',
          colorBgLayout: isDark ? '#133139' : '#f0fbfa',

          // Colores de borde
          colorBorder: isDark ? '#3ab7bf' : '#b5eaec',
          colorBorderSecondary: isDark ? '#2da3ad' : '#83d9dd',

          // Colores primarios
          colorPrimary: '#288592',
          colorPrimaryHover: '#266c78',
          colorPrimaryActive: '#275963',

          // Colores de éxito, error, warning
          colorSuccess: '#10b981',
          colorError: '#ef4444',
          colorWarning: '#f59e0b',
          colorInfo: '#288592',

          // Radio del border radius
          borderRadius: 8,

          // Espaciado
          padding: 16,
          margin: 16,
        },
        components: {
          Typography: {
            // Override específico para Typography
            colorText: isDark ? '#ffffff' : '#1e293b',
            colorTextHeading: isDark ? '#ffffff' : '#288592',
            colorTextSecondary: isDark ? '#83d9dd' : '#288592',
          },
          Button: {
            // Override para botones
            borderRadius: 8,
            controlHeight: 40,
          },
          Input: {
            // Override para inputs
            borderRadius: 8,
            controlHeight: 40,
          },
          Layout: {
            // Override específico para Layout (navbar)
            colorBgContainer: isDark ? '#254a54' : '#ffffff',
            colorBgHeader: isDark ? '#254a54' : '#ffffff',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
