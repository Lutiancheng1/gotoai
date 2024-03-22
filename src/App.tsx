import React, { Suspense } from 'react'
import { createRoutesFromElements, createBrowserRouter, RouterProvider, Route, redirect } from 'react-router-dom'
import './App.css'

const NotFound = React.lazy(() => import('@/pages/NotFound'))
const Home = React.lazy(() => import('@/pages/Home'))
const Loading = React.lazy(() => import('@/pages/Loading'))
const Login = React.lazy(() => import('@/pages/Login'))
const Document = React.lazy(() => import('@/pages/Document'))
const Code = React.lazy(() => import('@/pages/Code'))
const KnowledgeBase = React.lazy(() => import('@/pages/KnowledgeBase'))
const DataAnalysis = React.lazy(() => import('@/pages/DataAnalysis'))
const DrawDesigns = React.lazy(() => import('@/pages/DrawDesigns'))
const Video = React.lazy(() => import('@/pages/Video'))
const Application = React.lazy(() => import('@/pages/Application'))

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route errorElement={<NotFound />}>
        {/* <Route /> */}
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          loader={() => {
            throw redirect('talk')
          }}
        />
        <Route path="/talk" element={<Home />} />
        <Route path="/document" element={<Document />} />
        <Route path="/code" element={<Code />} />
        <Route path="/knowledgeBase" element={<KnowledgeBase />} />
        <Route path="/dataAnalysis" element={<DataAnalysis />} />
        <Route path="/drawDesigns" element={<DrawDesigns />} />
        <Route path="/video" element={<Video />} />
        <Route path="/application" element={<Application />} />
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
