document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('вхідні'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('надіслані'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('архів'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('вхідні');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Логіка форми надсилання листів
  document.querySelector('form').onsubmit = () => {
    const to = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: to,
        subject: subject,
        body: body
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
    });
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Відображення списку вхідних листів
  if (mailbox === 'вхідні'){
    fetch('emails/inbox')
    .then(response => response.json())
    .then(emails => {
      console.log("Виводимо всі вхідні листи в консоль")
      console.log(emails)
      emails.forEach(element => {
        //document.querySelector('#emails-view').innerHTML.
        const inbox_list = document.createElement('div');
        inbox_list.className = 'inbox_list'
        inbox_list.innerHTML = `<h4>${element.sender}</h4>    ${element.subject}    <p style="float:right;">${element.timestamp}</p>`
        document.querySelector('#emails-view').append(inbox_list);
      });
    })
  }

  if (mailbox === 'надіслані'){
    fetch('emails/sent')
    .then(response => response.json())
    .then(emails => {
      console.log("Виводимо всі надіслані листи в консоль")
      console.log(emails)
      emails.forEach(element => {
        //document.querySelector('#emails-view').innerHTML.
        const inbox_list = document.createElement('div');
        inbox_list.className = 'inbox_list'
        inbox_list.innerHTML = `<h4>${element.recipients}</h4>    ${element.subject}    <p style="float:right;">${element.timestamp}</p>`
        document.querySelector('#emails-view').append(inbox_list);
      });
    })
  }

  
  // // document.querySelector('#emails-view').append(list);
}
