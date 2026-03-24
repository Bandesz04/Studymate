import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import MainPage from './pages/MainPage';
import NotesPage from './pages/NotesPage';
import PrivateRoute from './components/PrivateRoute';
import NoteDetailPage from './pages/NoteDetailPage';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider>
          <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<AuthLayout><LoginPage /></AuthLayout>} />
                    <Route path="/register" element={<AuthLayout><RegistrationPage /></AuthLayout>} />

                    <Route
                        path="/home"
                        element={
                            <PrivateRoute>
                                <AppLayout>
                                  <MainPage />
                                </AppLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/notes"
                        element={
                            <PrivateRoute>
                                <AppLayout>
                                  <NotesPage />
                                </AppLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/notes/:id"
                        element={
                            <PrivateRoute>
                                <AppLayout>
                                  <NoteDetailPage />
                                </AppLayout>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
          </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>
);
