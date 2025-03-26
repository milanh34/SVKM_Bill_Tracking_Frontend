import "../styles/ContactTable.css";
import updownarrow from "../assets/updownarrow.svg";

const ContactsTable = () => {
  const contacts = [
    {
      name: "Karin",
      email: "karin@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "yellow",
    },
    {
      name: "Shabrina",
      email: "shabrina@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "red",
    },
    {
      name: "Joel",
      email: "joel@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "blue",
    },
    {
      name: "Kevin",
      email: "kevin@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "yellow",
    },
    {
      name: "Kevin",
      email: "kevin@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "yellow",
    },
    {
      name: "Kevin",
      email: "kevin@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "yellow",
    },
    {
      name: "Kevin",
      email: "kevin@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "yellow",
    },
    {
      name: "Kevin",
      email: "kevin@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "yellow",
    },
    {
      name: "Kevin",
      email: "kevin@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "yellow",
    },
    {
      name: "Kevin",
      email: "kevin@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "yellow",
    },
    {
      name: "Kevin",
      email: "kevin@gmail.com",
      lastContacted: "Mon 9 Aug, 10:49 AM",
      avatarUrl:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-02-13%20192752-u6wDAvPm7wcVrr3MlPl8WKybKq5d8f.png",
      leadSource: "Online Store",
      leadSourceColor: "yellow",
    },
    // Add more contacts as needed
  ]

  return (
    <div className="contacts-table-container">
      <table className="contacts-table">
        <thead>
          <tr>
            <th>
              CONTACT NAME
              <img src={updownarrow}/>  
            </th>
            <th>
              LAST CONTACTED
              <img src={updownarrow}/>  
            </th>
            <th>
              COMPANY
              <img src={updownarrow}/>  
            </th>
            <th>
              CONTACT
              <img src={updownarrow}/>  
            </th>
            <th>
              LEAD SOURCE
              <img src={updownarrow}/>  
            </th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact, index) => (
            <tr key={index}>
              <td>
                <div className="contact-info">
                  <img src={contact.avatarUrl || "/placeholder.svg"} alt={contact.name} className="avatar" />
                  <div>
                    <div className="contact-name">{contact.name}</div>
                    <div className="contact-email">{contact.email}</div>
                  </div>
                </div>
              </td>
              <td>{contact.lastContacted}</td>
              <td>
                <div className="company">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="company-logo" />
                  Google
                </div>
              </td>
              <td>
                <a href={`mailto:${contact.email}`} className="contact-email-link">
                  {contact.email}
                </a>
              </td>
              <td>
                <span className={`lead-source ${contact.leadSourceColor}`}>{contact.leadSource}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ContactsTable;