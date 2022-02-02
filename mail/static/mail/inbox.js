document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('вхідні'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('надіслані'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('архів'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('вхідні');

  // Розширювач для textarea.
  const tx = document.querySelector("#compose-body");
  tx.setAttribute("style", "height:" + (tx.scrollHeight) + "px;overflow-y:hidden;");
  tx.addEventListener("input", OnInput, false);


function OnInput() {
  this.style.height = "auto";
  this.style.height = (this.scrollHeight) + "px";
}

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#letter-view').style.display = 'none';
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
        // Вивести результат в консоль
        console.log(result);
        load_mailbox('надіслані')
    });
    return false;
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#letter-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Відображення списку вхідних листів
  if (mailbox === 'вхідні'){
    fetch('emails/inbox')
    .then(response => response.json())
    .then(emails => {
      console.log("Виводимо всі вхідні листи в консоль")
      console.log(emails)

      //Відображення вхідних листів

      emails.forEach(element => {
        const display_div = document.createElement('div');
        display_div.className = 'display_div';
        const inbox_list = document.createElement('div');
        inbox_list.className = 'inbox_div';
        inbox_list.innerHTML = `<h4>від: ${element.sender}</h4>    ${element.subject}    <p style="float:right;">${element.timestamp}</p>`
        if (element.read === true){
          inbox_list.style = 'background-color: #a1a1a1';
        } else {
          inbox_list.style = 'background-color: white';
        }

        // Перегляд листа 

        inbox_list.addEventListener('click', function() {
          letter_view(element)
        });
        const archive_button = document.createElement('button');
        archive_button.className = 'archive-button';
        archive_button.innerHTML = 'Архівувати';
        archive_button.onclick = function() {
          display_div.remove;
          console.log(`Спроба архівувати лист з ID ${element.id}`);
          fetch(`/emails/${element.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: true
            })
          })
          .then(()=>{
            console.log('Лист Архівовано');
            load_mailbox('вхідні');
          })
        }
        display_div.append(inbox_list, archive_button);
        document.querySelector('#emails-view').append(display_div);
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
        // inbox_list.className = 'inbox_div';
        inbox_list.className = 'display_div';
        inbox_list.innerHTML = `<div class='inbox_div'><h4>кому: ${element.recipients}</h4>    ${element.subject}    <p style="float:right;">${element.timestamp}</p></div>`;
        if (element.read === true){
          inbox_list.children[0].style = 'background-color: #a1a1a1';
        }else {
          inbox_list.children[0].style = 'background-color: white';
        }
        inbox_list.addEventListener('click', function() {
          letter_view(element)
        });
        document.querySelector('#emails-view').append(inbox_list);
      });
    })
  }
  if (mailbox === 'архів'){
    fetch('emails/archive')
    .then(response => response.json())
    .then(emails => {
      console.log("Виводимо архів листів в консоль")
      console.log(emails)
      emails.forEach(element => {
        //document.querySelector('#emails-view').innerHTML.
        const display_div = document.createElement('div');
        display_div.className = 'display_div';
        const inbox_list = document.createElement('div');
        inbox_list.className = 'inbox_div';
        inbox_list.innerHTML = `<h4>від: ${element.sender}</h4>    ${element.subject}    <p style="float:right;">${element.timestamp}</p>`
        inbox_list.addEventListener('click', function() {
          letter_view(element)
        });
        if (element.read === true){
          inbox_list.style = 'background-color: #a1a1a1';
        } else {
          inbox_list.style = 'background-color: white';
        }
        const archive_button = document.createElement('button');
        archive_button.className = 'archive-button';
        archive_button.innerHTML = 'Розархівувати'
        display_div.append(inbox_list, archive_button);
        document.querySelector('#emails-view').append(display_div);
        archive_button.onclick = function() {
          console.log(`Спроба розархівувати лист з ID ${element.id}`);
          fetch(`/emails/${element.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: false
            })
          })
          .then(() => {
            console.log('Лист розархівовано');
            load_mailbox('вхідні')
            
          })
          // .then(() => location.reload())   Воно працює
        }
      });
    })
  }

function letter_view(element) {
  console.log(`Натиснуто на лист з ID ${element.id}`)
  if (element.read === false) {
    fetch(`/emails/${element.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    });
  }
  // Прибираємо всі непотрібні елементи
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#letter-view').style.display = 'block';
  
  // Промальовуємо лист
  document.querySelector('#from').innerHTML=`Від: ${element.sender}`;
  document.querySelector('#to').innerHTML=`Кому: ${element.recipients}`;
  document.querySelector('#subject').innerHTML=`Тема: ${element.subject}`;
  document.querySelector('#body').innerHTML=`${element.body}`;
  document.querySelector('#timestamp').innerHTML=`Час: ${element.timestamp}`;
  document.querySelector('#answer').onclick = function() {
    console.log('Натиснуто кнопку "Відповісти"')
    reply(element);
  }
  // document.createElement('button')
}

function reply (element) {
  compose_email();
  //Заповнення відправника
  document.querySelector('#compose-recipients').value = element.sender;

  //Заповнення теми
  let re = '';
  let pasta = 'Re: ';
  for (let i = 0; i < 4; i++){
    re += element.subject.charAt(i);
    console.log(re);
  }
  if (re !== pasta) {
    re = pasta + element.subject;
  }else {
    re = element.subject;
  }
  document.querySelector('#compose-subject').value = re;

  //Заповнення тіла
  document.querySelector('#compose-body').value += `\n_______________________\n${element.timestamp} ${element.sender} написав: ${element.body}\n`
  
  // document.querySelector('#compose-body').value += '<br>'
}

}
