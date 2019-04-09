import { Component } from 'react';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import router from 'next/router';
import { Layout, Input, Icon, Form, Button, Checkbox, Card } from 'antd';
import gql from 'graphql-tag';
import { setAccessToken, setRefreshToken } from '../utils/auth';
import '../styles/sign.less';

const FormItem = Form.Item;
const { Content, Header } = Layout;

const SIGNUP_USER = gql`
  mutation SignupUser($email: String!, $password: String!, $username: String!) {
    signupUser(email: $email, password: $password, username: $username) {
      user {
        email
        username
        avatar
        github
        wechat
      }
      accessToken
      refreshToken
    }
  }
`;

class RegisterPage extends Component {
  static getInitialProps({ query }) {
    return { query };
  }

  render() {
    const {
      form: { getFieldDecorator, validateFields },
    } = this.props;

    return (
      <Mutation
        mutation={SIGNUP_USER}
        onCompleted={data => {
          const {
            signupUser: { accessToken, refreshToken },
          } = data;
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          const { redirect_uri } = this.props;
          if (redirect_uri) router.push(redirect_uri);
          else router.push('/home');
        }}
      >
        {(signupUser, { data, loading }) => (
          <Layout className="sign-wrap">
            <Content>
              <Card className="sign-form-card">
                <div className="info-wrap">
                  <img src="/static/backpack.png" />
                  <h1>Sign up for 2Newspaper</h1>
                </div>
                <Form
                  onSubmit={e => {
                    e.preventDefault();
                    validateFields((error, values) => {
                      if (!error) {
                        const { email, password, username } = values;
                        signupUser({ variables: { email, password, username } });
                      }
                    });
                  }}
                >
                  <FormItem>
                    {getFieldDecorator('username', {
                      rules: [{ required: true, message: 'Please input your username!' }],
                    })(<Input prefix={<Icon type="user" />} placeholder="Username" />)}
                  </FormItem>
                  <FormItem>
                    {getFieldDecorator('email', {
                      rules: [
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: '邮箱格式不正确' },
                      ],
                    })(<Input prefix={<Icon type="link" />} placeholder="Email" />)}
                  </FormItem>

                  <FormItem>
                    {getFieldDecorator('password', {
                      rules: [{ required: true, message: 'Please input your password!' }],
                    })(
                      <Input prefix={<Icon type="lock" />} type="password" placeholder="Password" />
                    )}
                  </FormItem>
                  <FormItem>
                    <Button
                      loading={loading}
                      type="primary"
                      htmlType="submit"
                      className="sign-form-button"
                    >
                      Sign up
                    </Button>
                    Or{' '}
                    <Link href={{ pathname: '/login', query: { name: 1 } }}>
                      <a>login now!</a>
                    </Link>
                  </FormItem>
                </Form>
              </Card>
            </Content>
          </Layout>
        )}
      </Mutation>
    );
  }
}

export default Form.create()(RegisterPage);
