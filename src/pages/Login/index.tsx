import { useEffect, useState } from 'react'
import './index.css'
import { Button, Checkbox, ConfigProvider, Form, type FormProps, Input } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import Loading from '@/components/loading'
import { sleep } from 'openai/core'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/images/logo.png'
import Toast from '@/components/toast'
import { getUserInfo, hasUserInfo, removeUserInfo, setUserInfo } from '@/utils/storage'
type FieldType = {
  username?: string
  password?: string
  remember?: string
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const onFinish: FormProps<FieldType>['onFinish'] = async ({ username, password, remember }) => {
    setLoading(true)
    if (remember) {
      console.log('jizhu')

      setUserInfo({
        username: username!,
        password: password!
      })
    } else {
      removeUserInfo()
    }
    setTimeout(async () => {
      navigate('/', { replace: true })
    }, 1000)
    console.log(form)

    // Toast({
    //   type: 'success',
    //   message: '登陆成功'
    // })
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (err) => {
    console.log('Failed:', err)
  }
  const restPassword = () => {
    console.log('goto rest')
  }

  useEffect(() => {
    if (hasUserInfo()) {
      const userInfo = getUserInfo()
      form.setFieldsValue(userInfo)
    }
  }, [form])
  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {},
          Input: {
            // activeBorderColor: '',
            hoverBorderColor: ''
          },
          Button: {
            // defaultHoverBorderColor: '',
            // defaultHoverColor: '',
            // defaultHoverBg: '',
            // defaultActiveColor: '',
            // defaultActiveBorderColor: '',
            // defaultBg: '#008997'
          }
        }
      }}
    >
      <div className="login">
        {loading && <Loading></Loading>}
        <div className="my_container right-panel-active">
          {/* Sign In */}
          <div className="container__form container--signin">
            <Form form={form} className="form" id="form2" initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
              <div className="logo w-20">
                <img src={logo} alt="" />
              </div>
              <h2 className="form__title">Sign In</h2>
              <Form.Item<FieldType> labelAlign="left" name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
                <Input
                  style={{
                    padding: '10px'
                  }}
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="User"
                />
              </Form.Item>

              <Form.Item<FieldType> labelAlign="left" name="password" rules={[{ required: true, message: '请输入密码！' }]} style={{ marginBottom: 0 }}>
                <Input.Password
                  style={{
                    padding: '10px'
                  }}
                  prefix={<i className="iconfont icon-mima"></i>}
                  placeholder="Password"
                  autoComplete="off"
                />
              </Form.Item>

              <Form.Item<FieldType> name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>

              <a href={undefined} className="link" onClick={() => restPassword()}>
                Forgot your password?
              </a>

              <Form.Item>
                <Button disabled={loading} className="btn" htmlType="submit">
                  Sign In
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Overlay */}
          <div className="container__overlay">
            <div className="overlay"></div>
          </div>

          <div className="copyright">
            <p></p>
          </div>
        </div>
      </div>
    </ConfigProvider>
  )
}
