import React from 'react'
import Header from '../components_tailwind/Header';
import ContactsTable from '../components_tailwind/ContactsTable';

const ContactPage = () => {
  return (
    <div style={{width:'100%', backgroundColor:'#f0f0f0', color:'black'}}>
        <Header />

        <ContactsTable />
    </div>
  )
}

export default ContactPage;
