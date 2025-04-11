import React from 'react'
import Header from '../components/Header';
import ContactsTable from '../components/ContactsTable';

const ContactPage = () => {
  return (
    <div style={{width:'100%', backgroundColor:'#f0f0f0', color:'black'}}>
        <Header />

        <ContactsTable />
    </div>
  )
}

export default ContactPage;
