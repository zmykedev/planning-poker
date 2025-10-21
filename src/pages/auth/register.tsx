import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Avatar, Button, Card, Col, Form, Input, Row, Space, Typography, Radio } from 'antd';
import { BookOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import usePlanningPokerStore from '../../store';

const { Title, Text } = Typography;

interface FormData {
  name: string;
  role: 'voter' | 'spectator';
}

const PlanningPokerEntry = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const setCurrentUser = usePlanningPokerStore((state) => state.setCurrentUser);

  const handleSubmit = (values: FormData) => {
    setIsLoading(true);
    setCurrentUser({
      id: crypto.randomUUID(),
      name: values.name,
      role: 'participant', // Ajustado para cumplir con los valores válidos ('participant' o 'moderator')
      isOnline: true,
    });

    // Navegamos a la página principal de la sesión
    setTimeout(() => {
      navigate('/main');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className='gradient-primary min-h-screen'>
      <div className='flex items-center justify-center p-4 min-h-screen'>
        <Card className='shadow-2xl border-0 flex-grow-0 max-w-md w-full'>
          {/* Header */}
          <div className='text-center mb-8'>
            <Space direction='vertical' size='large' className='w-full'>
              <Avatar size={64} style={{ backgroundColor: '#288592' }} icon={<BookOutlined />} />
              <Title level={2} className='mb-2 text-fountain-blue-900'>
                Planning Poker
              </Title>
              <Text type='secondary'>Ingresa tu nombre para unirte a la sesión.</Text>
            </Space>
          </div>

          {/* Formulario */}
          <Form
            form={form}
            name='join'
            onFinish={handleSubmit}
            layout='vertical'
            size='large'
            requiredMark={false}
            initialValues={{ role: 'voter' }}
          >
            {/* Nombre */}
            <Form.Item
              name='name'
              label='Nombre'
              rules={[
                { required: true, message: 'Por favor ingresa tu nombre' },
                { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
              ]}
            >
              <Input
                prefix={<UserOutlined className='text-fountain-blue-400' />}
                placeholder='Tu nombre'
                autoComplete='name'
              />
            </Form.Item>

            {/* Rol */}
            <Form.Item name='role' label='Rol'>
              <Radio.Group buttonStyle='solid' className='w-full'>
                <Row>
                  <Col span={12}>
                    <Radio.Button value='voter' className='w-full text-center'>
                      Votante
                    </Radio.Button>
                  </Col>
                  <Col span={12}>
                    <Radio.Button value='spectator' className='w-full text-center'>
                      Espectador
                    </Radio.Button>
                  </Col>
                </Row>
              </Radio.Group>
            </Form.Item>

            {/* Botón de envío */}
            <Form.Item className='mt-8 mb-0'>
              <Button
                type='primary'
                htmlType='submit'
                loading={isLoading}
                icon={<LoginOutlined />}
                size='large'
                className='w-full h-12 text-base font-medium'
                style={{ backgroundColor: '#288592', borderColor: '#288592' }}
              >
                {isLoading ? 'Uniéndose...' : 'Unirse a la sesión'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default PlanningPokerEntry;
