import React from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout.jsx'
import AuthedLayout from './layouts/AuthedLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'

import LoginPage from './pages/auth/LoginPage.jsx'
import SignupPage from './pages/auth/SignupPage.jsx'

import OnboardingQcmPage from './pages/app/OnboardingQcmPage.jsx'
import DashboardPage from './pages/app/DashboardPage.jsx'
import CatalogPage from './pages/app/CatalogPage.jsx'
import CourseDetailPage from './pages/app/CourseDetailPage.jsx'
import CartPage from './pages/app/CartPage.jsx'
import CheckoutPage from './pages/app/CheckoutPage.jsx'
import CheckoutSuccessPage from './pages/app/CheckoutSuccessPage.jsx'
import InstructorPage from './pages/app/InstructorPage.jsx'
import AdminPage from './pages/app/AdminPage.jsx'
import AiPage from './pages/app/AiPage.jsx'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route element={<PublicLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route element={<AuthedLayout />}>
          <Route
            path="/onboarding-qcm"
            element={
              <RequireAuth role="student">
                <OnboardingQcmPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireAuth role="student">
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/catalog"
            element={
              <RequireAuth>
                <CatalogPage />
              </RequireAuth>
            }
          />
          <Route
            path="/course/:id"
            element={
              <RequireAuth>
                <CourseDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/cart"
            element={
              <RequireAuth role="student">
                <CartPage />
              </RequireAuth>
            }
          />
          <Route
            path="/checkout"
            element={
              <RequireAuth role="student">
                <CheckoutPage />
              </RequireAuth>
            }
          />
          <Route
            path="/checkout/success"
            element={
              <RequireAuth role="student">
                <CheckoutSuccessPage />
              </RequireAuth>
            }
          />
          <Route
            path="/instructor"
            element={
              <RequireAuth role="teacher">
                <InstructorPage />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireAuth role="admin">
                <AdminPage />
              </RequireAuth>
            }
          />
          <Route
            path="/ai"
            element={
              <RequireAuth roles={['teacher', 'admin']}>
                <AiPage />
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </HashRouter>
  )
}
