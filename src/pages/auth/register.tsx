import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Progress,
  Row,
  Space,
  Typography,
} from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  MailOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { API_ENDPOINTS } from '@/config/api';

const { Title, Text } = Typography;
const { Password } = Input;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const PASSWORD_RULES = [
  { test: (p: string) => /[A-Z]/.test(p), text: 'Una letra mayúscula' },
  { test: (p: string) => /[a-z]/.test(p), text: 'Una letra minúscula' },
  { test: (p: string) => /[0-9]/.test(p), text: 'Un número' },
  { test: (p: string) => /[@$!%*?&]/.test(p), text: 'Un carácter especial' },
];

const Register = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [passwordValidation, setPasswordValidation] = useState({
    isValid: false,
    strength: 0,
    requirements: PASSWORD_RULES.map((rule) => ({ ...rule, met: false })),
  });

  // Función simple para encriptar la contraseña
  const encryptPassword = (password: string): string => {
    const key = 'cmpc2024'; // Misma clave que el login
    let encrypted = '';
    for (let i = 0; i < password.length; i++) {
      encrypted += String.fromCharCode(password.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(encrypted); // Codificar en base64
  };

  const validatePassword = (password: string) => {
    const requirements = PASSWORD_RULES.map((rule) => ({
      ...rule,
      met: rule.test(password),
    }));

    const metCount = requirements.filter((req) => req.met).length;
    const strength = Math.round((metCount / requirements.length) * 100);
    const isValid = metCount === requirements.length;

    setPasswordValidation({ isValid, strength, requirements });
    return isValid;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return '#ff4d4f';
    if (strength < 70) return '#faad14';
    return '#52c41a';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    validatePassword(password);
  };

  const handleSubmit = async (values: FormData) => {
    if (!passwordValidation.isValid) {
      setErrors({ password: 'La contraseña no cumple con todos los requisitos' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const encryptedPassword = encryptPassword(values.password);

      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: encryptedPassword,
        }),
      });

      if (response.ok) {
        navigate('/login', {
          state: { message: 'Cuenta creada exitosamente. Por favor inicia sesión.' },
        });
      } else {
        const errorData = await response.json();
        if (errorData.errors) {
          setErrors(errorData.errors);
        } else {
          setErrors({ email: errorData.message || 'Error al crear la cuenta' });
        }
      }
    } catch (err) {
      console.error(err);
      setErrors({ email: 'Error de conexión. Inténtalo de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFieldValid = (field: keyof FormData) => {
    return !errors[field] && form.getFieldValue(field);
  };

  return (
    <div className='gradient-primary min-h-screen'>
      <div className='flex items-center justify-center p-4 min-h-screen'>
        <Card className='shadow-2xl border-0 flex-grow-0 max-w-md w-full h-full'>
          {/* Header */}
          <div className='text-center mb-8'>
            <Space direction='vertical' size='large' className='w-full'>
              <Avatar size={64} style={{ backgroundColor: '#288592' }} icon={<BookOutlined />} />
              <Title level={2} className='mb-2 text-fountain-blue-900'>
                Crear cuenta
              </Title>
            </Space>
          </div>

          {/* Formulario */}
          <Form
            form={form}
            name='register'
            onFinish={handleSubmit}
            layout='vertical'
            size='large'
            requiredMark={false}
          >
            {/* Nombre y Apellido */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='firstName'
                  label='Nombre'
                  rules={[
                    { required: true, message: 'Por favor ingresa tu nombre' },
                    { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
                  ]}
                  validateStatus={isFieldValid('firstName') ? 'success' : undefined}
                  help={errors.firstName}
                >
                  <Input
                    prefix={<UserOutlined className='text-fountain-blue-400' />}
                    placeholder='Tu nombre'
                    autoComplete='given-name'
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='lastName'
                  label='Apellido'
                  rules={[
                    { required: true, message: 'Por favor ingresa tu apellido' },
                    { min: 2, message: 'El apellido debe tener al menos 2 caracteres' },
                  ]}
                  validateStatus={isFieldValid('lastName') ? 'success' : undefined}
                  help={errors.lastName}
                >
                  <Input
                    prefix={<UserOutlined className='text-fountain-blue-400' />}
                    placeholder='Tu apellido'
                    autoComplete='family-name'
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Email */}
            <Form.Item
              name='email'
              label='Correo electrónico'
              rules={[
                { required: true, message: 'Por favor ingresa tu correo electrónico' },
                { type: 'email', message: 'Por favor ingresa un correo válido' },
              ]}
              validateStatus={isFieldValid('email') ? 'success' : undefined}
              help={errors.email}
            >
              <Input
                prefix={<MailOutlined className='text-fountain-blue-400' />}
                placeholder='tu@email.com'
                autoComplete='email'
              />
            </Form.Item>

            {/* Contraseña */}
            <Form.Item
              name='password'
              label='Contraseña'
              rules={[
                { required: true, message: 'Por favor ingresa una contraseña' },
                { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
              ]}
              help={errors.password}
            >
              <Password
                prefix={<LockOutlined className='text-fountain-blue-400' />}
                placeholder='••••••••'
                autoComplete='new-password'
                onChange={handlePasswordChange}
              />
            </Form.Item>

            {/* Validación de contraseña */}
            {form.getFieldValue('password') && (
              <div className='mb-6'>
                {/* Barra de fortaleza */}
                <div className='mb-3'>
                  <Text type='secondary' className='text-sm text-fountain-blue-700'>
                    Fortaleza de la contraseña:
                  </Text>
                  <Progress
                    percent={passwordValidation.strength}
                    strokeColor={getStrengthColor(passwordValidation.strength)}
                    size='small'
                    className='mt-1'
                  />
                </div>

                {/* Requisitos */}
                <div className='space-y-2'>
                  {passwordValidation.requirements.map((req, index) => (
                    <div key={index} className='flex items-center space-x-2'>
                      {req.met ? (
                        <CheckCircleOutlined className='text-green-500' />
                      ) : (
                        <CloseCircleOutlined className='text-fountain-blue-400' />
                      )}
                      <Text type={req.met ? 'success' : 'secondary'} className='text-sm'>
                        {req.text}
                      </Text>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <Form.Item className='mb-6'>
              <Button
                type='primary'
                htmlType='submit'
                loading={isLoading}
                icon={<UserAddOutlined />}
                size='large'
                className='w-full h-12 text-base font-medium'
                disabled={!passwordValidation.isValid}
                style={{ backgroundColor: '#288592', borderColor: '#288592' }}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </Form.Item>
          </Form>

          <Divider>o</Divider>

          {/* Login */}
          <div className='text-center'>
            <Space direction='vertical' size='small'>
              <Text type='secondary' className='text-fountain-blue-700'>
                ¿Ya tienes una cuenta?
              </Text>
              <Button
                type='link'
                icon={<UserOutlined />}
                onClick={() => navigate('/auth/login')}
                className='text-fountain-blue-600 hover:text-fountain-blue-800 font-medium'
                size='large'
              >
                Iniciar sesión
              </Button>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
