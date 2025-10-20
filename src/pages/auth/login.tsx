import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Space,
  Typography,
} from 'antd';
import {
  BookOutlined,
  LockOutlined,
  LoginOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { API_ENDPOINTS } from '@/config/api';
import useStore from '../../store';

const { Title, Text, Link } = Typography;
const { Password } = Input;

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useStore();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función simple para encriptar la contraseña
  const encryptPassword = (password: string): string => {
    const key = 'cmpc2024'; // Clave secreta
    let encrypted = '';
    for (let i = 0; i < password.length; i++) {
      encrypted += String.fromCharCode(password.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted); // Codificar en base64
  };

  const handleSubmit = async (values: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const encryptedPassword = encryptPassword(values.password);

      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: encryptedPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // El ResponseInterceptor envuelve la respuesta en data.data
        const session = data.data?.session || data.session;

        setSession(session);

        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='gradient-primary min-h-screen'>
      <div className='flex items-center justify-center p-4 min-h-screen'>
        <Card
          className='w-full max-w-md shadow-2xl border-0 card-primary'
          styles={{ body: { padding: '40px' } }}
        >
          {/* Header */}
          <div className='text-center mb-8'>
            <Space direction='vertical' size='large' className='w-full'>
              <Avatar size={64} style={{ backgroundColor: '#288592' }} icon={<BookOutlined />} />
              <Title level={2} className='mb-2 text-primary'>
                Bienvenido de vuelta
              </Title>
            </Space>
          </div>

          {/* Mensaje de éxito */}
          {location.state?.message && (
            <Alert message={location.state.message} type='success' showIcon className='mb-6' />
          )}

          {/* Formulario */}
          <Form
            form={form}
            name='login'
            onFinish={handleSubmit}
            layout='vertical'
            size='large'
            requiredMark={false}
          >
            <Form.Item
              name='email'
              label='Correo electrónico'
              rules={[
                { required: true, message: 'Por favor ingresa tu correo electrónico' },
                { type: 'email', message: 'Por favor ingresa un correo válido' },
              ]}
            >
              <Input
                prefix={<UserOutlined className='text-fountain-blue-400' />}
                placeholder='tu@email.com'
                autoComplete='email'
              />
            </Form.Item>

            <Form.Item
              name='password'
              label='Contraseña'
              rules={[
                { required: true, message: 'Por favor ingresa tu contraseña' },
                { min: 6, message: 'La contraseña debe tener al menos 6 caracteres' },
              ]}
            >
              <Password
                prefix={<LockOutlined className='text-fountain-blue-400' />}
                placeholder='••••••••'
                autoComplete='current-password'
              />
            </Form.Item>

            <Form.Item>
              <div className='flex justify-between items-center'>
                <Checkbox>Recordarme</Checkbox>
                <Link href='/auth/forgot-password'>¿Olvidaste tu contraseña?</Link>
              </div>
            </Form.Item>

            {/* Error */}
            {error && <Alert message={error} type='error' showIcon className='mb-6' />}

            <Form.Item className='mb-4'>
              <Button
                type='primary'
                htmlType='submit'
                loading={isLoading}
                icon={<LoginOutlined />}
                size='large'
                className='w-full h-12 text-base font-medium'
                style={{ backgroundColor: '#288592', borderColor: '#288592' }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Form.Item>
          </Form>

          <Divider>o</Divider>

          {/* Registro */}
          <div className='text-center'>
            <Space direction='vertical' size='small'>
              <Text type='secondary' className='text-fountain-blue-700'>
                ¿No tienes una cuenta?
              </Text>
              <Button
                type='link'
                icon={<UserAddOutlined />}
                onClick={() => navigate('/auth/register')}
                className='text-fountain-blue-600 hover:text-fountain-blue-800 font-medium'
                size='large'
              >
                Crear cuenta
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
