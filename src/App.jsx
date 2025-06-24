import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Register from './pages/Register';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';

function App() {
	const { user } = useAuth();

	return(
		<Router>
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={<Dashboard />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route 
						path="/play" 
						element={user ? <GamePage /> : <Navigate to="/login" replace />} 
					/>
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
