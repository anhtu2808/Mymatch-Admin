import React from 'react';
import { Card, Row, Col, Avatar, Tag, Button, Space } from 'antd';
import { TeamOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';

const Teams: React.FC = () => {
  const teams = [
    {
      id: 1,
      name: 'Team Alpha',
      members: 5,
      wins: 12,
      losses: 3,
      status: 'Active',
      description: 'Professional gaming team specializing in FPS games',
    },
    {
      id: 2,
      name: 'Team Beta',
      members: 4,
      wins: 8,
      losses: 7,
      status: 'Active',
      description: 'Casual team focused on strategy games',
    },
    {
      id: 3,
      name: 'Team Gamma',
      members: 6,
      wins: 15,
      losses: 2,
      status: 'Active',
      description: 'Competitive team with tournament experience',
    },
    {
      id: 4,
      name: 'Team Delta',
      members: 3,
      wins: 5,
      losses: 10,
      status: 'Inactive',
      description: 'New team looking for members',
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Teams Management</h1>
        <Button type="primary" icon={<TeamOutlined />}>
          Create New Team
        </Button>
      </div>
      
      <Row gutter={[16, 16]}>
        {teams.map((team) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={team.id}>
            <Card
              hoverable
              actions={[
                <Button type="link" key="view">View Details</Button>,
                <Button type="link" key="edit">Edit</Button>,
                <Button type="link" danger key="delete">Delete</Button>,
              ]}
            >
              <Card.Meta
                avatar={<Avatar size={64} icon={<TeamOutlined />} />}
                title={
                  <Space>
                    {team.name}
                    <Tag color={team.status === 'Active' ? 'green' : 'red'}>
                      {team.status}
                    </Tag>
                  </Space>
                }
                description={team.description}
              />
              
              <div style={{ marginTop: 16 }}>
                <Row gutter={8}>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        <UserOutlined /> {team.members}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Members</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                        <TrophyOutlined /> {team.wins}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Wins</div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                        {team.losses}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Losses</div>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Teams;
