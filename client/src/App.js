import React from 'react';
import './styles.css';
import { Route, Routes } from 'react-router-dom';
import MainPage from './pages/MainPage';
import Layout from './components/Layout';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

const App = () => {
    return(
    <Layout>
        <Routes>
            <Route path='/' element={<MainPage />} />
            <Route path='/signin' element={<SignInPage />} />
            <Route path='/signup' element={<SignUpPage />} />
        </Routes>
    </Layout>
    )
};

export default App;
