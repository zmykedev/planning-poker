import React from 'react';
import { Card, Avatar, Typography } from 'antd';

const { Title, Paragraph } = Typography;

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Card
      hoverable
      className='text-center h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300'
      bodyStyle={{ padding: '32px 24px' }}
    >
      <div className='mb-6'>
        <Avatar
          size={80}
          style={{ backgroundColor: '#288592' }}
          icon={icon}
          className='shadow-lg'
        />
      </div>
      <Title level={4} className='mb-4 text-fountain-blue-800'>
        {title}
      </Title>
      <Paragraph className='text-fountain-blue-700 leading-relaxed'>{description}</Paragraph>
    </Card>
  );
};
