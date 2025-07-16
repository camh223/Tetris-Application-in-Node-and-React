import React, { JSX, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { useAuth } from './context/AuthContext';

function App(): JSX.Element {
	return(
		<Router>
			<Routes>
				<Route element={<Layout />}>
					<Route 
						path="/" 
						element={<Navigate to="/dashboard" />}
					/>
					<Route path="/dashboard"
						element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						}
					/>
					<Route 
						path="/login" 
						element={
							<PublicOnlyRoute>
								<Login />
							</PublicOnlyRoute>
						}
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
