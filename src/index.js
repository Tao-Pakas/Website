import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ApolloClient, InMemoryCache,HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

// Components (all imports at top)
import HomePage from './Pages/Home/HomePage'
import Accommodation from './Pages/Accommodations/Accommodation';
import AboutPage from './Pages/About/AboutPage';
import ContactUs from './Pages/Contact/ContactUs';
import SingleProperty from './Pages/SingleProperty/SingleProperty';
import Notfound from './Pages/Notfound';
import Navbar from './Components/Common/Navbar';
import Footer from './Components/Common/Footer';
import Hero from './Components/Common/Hero';
import Login from './Components/Forms/Login';
import DashBoard from './Pages/DashBoard/DashBoard';
import Favorites from './Pages/Favorites/Favorites';

import { AppProvider } from './Contexts/AppContext';
import Settings from './Pages/Settings/Settings';
import SavedPage from './Pages/SavedPage/SavedPage';

// Apollo Client setup intialize AppolloClient
const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:1337/graphql'}),
  cache: new InMemoryCache(),
});


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AppProvider>
      <ApolloProvider client={client}>
        <Router>
          <Navbar/>
          <Hero/>
          <Routes>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/Listings/:id?" element={<Accommodation/>} />
            <Route path="/About/:id?" element={<AboutPage/>} />
            <Route path="/Contact/:id?" element={<ContactUs/>} />
            <Route path="/Single/:id?" element={<SingleProperty/>}/>
            <Route path="*" element={<Notfound/>} />
            <Route path="/Login/:id?" element={<Login/>}/>
            <Route path="/Favourites/:id?" element={<Favorites/>}/>
            <Route path="/DashBoard/:id?" element={<DashBoard/>}/>
            <Route path="/SavedPage/:id?" element={<SavedPage/>}/>
            <Route path="/Settings/:id?" element={<Settings/>}/>
          </Routes>
          <Footer/>
        </Router>
      </ApolloProvider>
    </AppProvider>
  </React.StrictMode>
);