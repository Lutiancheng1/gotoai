import { useEffect, useState } from 'react'
import './index.css'
import { Button, Checkbox, ConfigProvider, Form, type FormProps, Input, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import Loading from '@/components/loading'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '@/assets/images/logo.png'
import Toast from '@/components/toast'
import { ipInCN, sleep } from '@/utils'
import { login } from '@/store/action/loginActions'
import { useDispatch } from 'react-redux'
import { useAppDispatch } from '@/store/hooks'
import { getAccountInfo, hasAccountInfo, removeAccountInfo, setAccountInfo } from '@/utils/storage'
type FieldType = {
  username?: string
  password?: string
  remember?: string
}

export default function Login() {
  // 定义一个loading状态
  const [loading, setLoading] = useState(false)
  // 使用navigate
  const navigate = useNavigate()
  // 使用Form
  const [form] = Form.useForm()
  // 使用location
  const location = useLocation()
  // 使用dispatch
  const dispatch = useAppDispatch()
  // 定义onFinish函数
  const onFinish: FormProps<FieldType>['onFinish'] = async ({ username, password, remember }) => {
    // 如果用户名或密码为空，则返回
    if (!username || !password) return
    // 设置loading为true
    setLoading(true)
    // 发起登录请求
    const res = await dispatch(
      login({
        name: username,
        password,
        type: 1
      })
    )
    // 设置loading为false
    setLoading(false)
    // 如果请求失败，则返回
    if (res.meta.requestStatus === 'rejected') return
    // 如果记住密码，则保存用户名和密码
    if (remember) {
      setAccountInfo({
        username: username,
        password: password
      })
    } else {
      // 否则删除用户名和密码
      removeAccountInfo()
    }
    // 提示登录成功
    Toast.notify({
      type: 'success',
      message: '登陆成功'
    })
    // 如果location有state，则跳转到from
    if (location.state) {
      const { from } = location.state
      return navigate(from)
    }
    // 否则跳转到首页
    navigate('/')
  }

  // 定义onFinishFailed函数
  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (err) => {
    console.log('Failed:', err)
  }
  // 定义restPassword函数
  const restPassword = () => {
    console.log('goto rest')
  }

  // 使用了React的useEffect钩子，当组件挂载时，会执行下面的代码
  useEffect(() => {
    // 如果用户信息存在
    if (hasAccountInfo()) {
      // 获取用户信息
      const userInfo = getAccountInfo()
      // 将用户信息设置到表单中
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
