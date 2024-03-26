import { useEffect, useState } from 'react'
import './index.css'
import { Button, Checkbox, ConfigProvider, Form, type FormProps, Input, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import Loading from '@/components/loading'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '@/assets/images/logo.png'
import Toast from '@/components/toast'
import { getUserInfo, hasUserInfo, removeUserInfo, setTokenInfo, setUserInfo } from '@/utils/storage'
import { ipInCN, sleep } from '@/utils'
import { login } from '@/api/login'
type FieldType = {
  username?: string
  password?: string
  remember?: string
}

export default function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const location = useLocation()
  const onFinish: FormProps<FieldType>['onFinish'] = async ({ username, password, remember }) => {
    if (!username || !password) return
    setLoading(true)
    const res = await login({
      username,
      password
    })
    console.log(res)
    if (!res.data) {
      setLoading(false)
      return Toast.notify({ type: 'error', message: res.msg })
    } else {
      setTokenInfo({ token: res.data.token })
      if (remember) {
        setUserInfo({
          username: username,
          password: password
        })
      } else {
        removeUserInfo()
      }
      Toast.notify({
        type: 'success',
        message: '登陆成功'
      })
      if (location.state) {
        const { from } = location.state
        return navigate(from)
      }
      navigate('/')
    }
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
  useEffect(() => {
    // ipInCN()
    if (location.state) {
      Toast.notify({ type: 'error', message: '请先登陆' })
    }
  }, [location.state])
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
        {loading && <div id="mask" className="w-full h-full opacity-30" style={{ position: 'absolute', zIndex: 999, backgroundColor: '#fff' }}></div>}
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

              <span className="link" onClick={() => restPassword()}>
                Forgot your password?
              </span>

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
