import React from 'react';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GamePage from './pages/GamePage';

function App() {
	return(
		<Router>
			<Routes>
				<Route element={<Layout />}>
					<Route path="/" element={<Dashboard />} />
					<Route path="/play" element={<GamePage />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;
