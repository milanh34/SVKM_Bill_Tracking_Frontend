import React from 'react'
import Header from '../../components/Header';
import ContactsTable from '../../components/archive/ContactsTable';

const ContactPage = () => {
  return (
    <div className="w-full bg-[#f0f0f0] text-black">
        <Header />
        <ContactsTable />
    </div>
  )
}

export default ContactPage;
