import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import store from './store'
import './assets/styles/main.css'
import './assets/iconFont/font_4472296_fmoexnv74v.css'
import 'animate.css'
import 'react-photo-view/dist/react-photo-view.css'
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Provider store={store}>
    {process.env.NODE_ENV === 'development' ? (
      <App />
    ) : (
      // 生产环境
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )}
  </Provider>
)
