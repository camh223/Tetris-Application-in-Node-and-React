import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Register from './pages/Register';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';
import ProtectedRoute from './components/ProtectedRoute';

function App(): JSX.Element {
	const { user } = useAuth();

	return(
		<Router>
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login"/>} />
					<Route path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route 
						path="/register" 
						element={user ? <Navigate to="/dashboard" /> : <Register />} 
					/>
					<Route 
						path="/login" 
						element={user ? <Navigate to="/dashboard" /> : <Login />} 
					/>
					<Route 
						path="/play" 
						element={
							<ProtectedRoute>
								<GamePage />
							</ProtectedRoute>
						} 
					/>
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
