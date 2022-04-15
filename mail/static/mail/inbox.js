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


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

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
      let email_line = document.createElement('div');
      email_line.textContent = `${each_email.sender}    ${each_email.subject}   ${each_email.timestamp}`;
      email_line.style.backgroundColor = "gray";
      email_line.style.border = "thin solid #000000"
      if (each_email.read === false) {
        email_line.style.backgroundColor = "orange";
      }
      document.querySelector('#emails-view').append(email_line);
    }


  });

}