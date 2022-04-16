document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Sending email
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');

});

function send_email(event) {
  // https://cs50.stackexchange.com/questions/38645/cs50-web-programming-mail-pset-dom-reloading-on-every-form-submission?rq=1
  event.preventDefault();
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.error === undefined) {
      alert(`Success : ${result.message}`);
      load_mailbox('sent');
    } else {
      alert(`Error : ${result.error}`);
    }
  })
  .catch(error => {
    console.log("Error", error);
  });
}


function compose_email(id) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#the_email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  if (id !== undefined) {
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      if (email.subject.slice(0, 3) !== "Re:") {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      } else {
        document.querySelector('#compose-subject').value = `${email.subject}`;
      }
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote : ${email.body}`;
    })
  }
}

function archive(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    return fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !email.archived
      })
    })
  })
  .then(() => load_mailbox('inbox'));
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#the_email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show emails in that particular mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    if (emails.error) {
        alert(emails.error);
    }
    for (let each_email of emails) {
      if ((each_email.archived === true) && (mailbox === 'inbox')) {
        continue;
      }

      let email_line = document.createElement('div');
      email_line.setAttribute("class", "mail_line");
      email_line.innerHTML = `<div>${each_email.sender}</div>    <div>${each_email.subject}</div>   <div>${each_email.timestamp}</div>`;
      if (each_email.read === false) {
        email_line.style.backgroundColor = "orange";
      }

      // Event listener for viewing individual email
      email_line.addEventListener('click', (event) => {
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#the_email').style.display = 'block';
        
        fetch(`/emails/${each_email.id}`)
        .then(response => response.json())
        .then(email => {
          let an_email = document.querySelector("#the_email");
          
          an_email.innerHTML = `
            <p>From : ${email.sender}</p>
            <p>To : ${email.recipients}</p>
            <p>Subject : ${email.subject}</p>
            <p>Timestamp : ${email.timestamp}</p>
            <button type="button" class="btn btn-outline-primary" id="reply">Reply</button>
            <button type="button" class="btn btn-outline-primary" id="archive">Archive</button>
            <hr>
            <p>${email.body}</p>
            `;
            if (email.archived === true) {
              document.querySelector('#archive').innerHTML = "Unarchive";
            }
            document.querySelector('#archive').onclick = (event) => archive(each_email.id);
            document.querySelector('#reply').onclick = () => compose_email(each_email.id);
        });

        fetch(`/emails/${each_email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        });
        
        
      });
      document.querySelector('#emails-view').append(email_line);
    }
  });
}

