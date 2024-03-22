import React, { Suspense } from 'react'
import { createRoutesFromElements, createBrowserRouter, RouterProvider, Route, redirect } from 'react-router-dom'
import './App.css'

const NotFound = React.lazy(() => import('@/pages/NotFound'))
const Loading = React.lazy(() => import('@/pages/Loading'))
const Login = React.lazy(() => import('@/pages/Login'))
const Layout = React.lazy(() => import('@/Layout'))
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route errorElement={<NotFound />}>
        {/* <Route /> */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          loader={async () => {
            throw redirect('/talk')
          }}
        />

        <Route path="/*" element={<Layout />} />
      </Route>
    </>
  )
)
export default function App() {
  return (
    <div className="app">
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </div>
  )
}
