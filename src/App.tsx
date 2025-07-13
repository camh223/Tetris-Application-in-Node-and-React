import React, { JSX, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthContext } from './context/AuthContext';

function App(): JSX.Element {
	const { user } = useContext(AuthContext);

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
