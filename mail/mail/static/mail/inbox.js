
document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send Mail
  document.querySelector('#compose-form').onsubmit = function () {

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
      })
    })
      .then(response => response.json())
      .then(result => {
        if (result.message) {
          load_mailbox('sent');
          document.querySelector('#compose-success').innerHTML = result.message;
          document.querySelector('#compose-success').style.color = 'green';
        } else {
          document.querySelector('#compose-error').innerHTML = result.error;
          document.querySelector('#compose-error').style.color = 'red';
        }
        // Clean success' and error's message after a few seconds
        setTimeout(() => {
          document.querySelector('#compose-success').innerHTML = '';
          document.querySelector('#compose-error').innerHTML = '';
        }, 7000);
      })
      .catch(error => {
        console.log("Compose error:", error)
      });

    return false;

  };

});

// ALL FUNCTIONS

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  if (mailbox == 'sent') {
    document.querySelector('#emails-title').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)} <span id="compose-success"></span>`;
  } else {
    document.querySelector('#emails-title').innerHTML = `${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}`;
  }

  // Get emails from this mailbox
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      load_emails(mailbox, emails.reverse());
    })
    .catch(error => {
      console.log(`${mailbox} error:`, error)
    });

}

function load_emails(mailbox, emails) {
  if (emails.error) {
    document.querySelector('#emails-container').innerHTML = emails.error
  } else {
    document.querySelector('#emails-container').innerHTML = ''
    emails.forEach(email => {
      let user = undefined
      const mail = document.createElement('div')
      mail.classList = 'email-item'
      mailbox == 'inbox' ? user = email.sender : user = email.recipients
      mail.innerHTML = `<span class="col-4">${user}</span><span class="col-4">${email.subject}</span><span class="col-4 text-right">${email.timestamp}</span>`;
      // Change the email background
      if (email.read) mail.style.backgroundColor = 'gray'
      // Append this email and Listing for user event
      document.querySelector('#emails-container').append(mail)
      mail.addEventListener('click', function () {
        load_email(mailbox, email.id)
      });
    });
  }
}

function load_email(mailbox, email_id) {

  // Show the email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // View email
  fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
      const archive_btn = document.querySelector('#email-archive')
      const replay_btn = document.querySelector('#email-reply')

      if (email.error) {
        document.querySelector('#email-view').innerHTML = email.error
      } else {
        // Mark email read and Set archive button
        email_read(email.id)
        if (mailbox == 'sent') { archive_btn.style.display = '' }
        if (email.archived) {
          archive_btn.innerHTML = 'Unarchive'
        } else {
          archive_btn.innerHTML = 'Archive'
        }

        // render email informations
        document.querySelector('#email-from').innerHTML = email.sender
        document.querySelector('#email-to').innerHTML = email.recipients
        document.querySelector('#email-subject').innerHTML = email.subject
        document.querySelector('#email-timestamp').innerHTML = email.timestamp
        document.querySelector('#email-body').innerHTML = email.body

        // Archive/unarchive email
        archive_btn.addEventListener('click', function () {
          if (!email.archived) { email_archive(email.id, true) } else { email_archive(email.id, false) }
          load_mailbox('inbox')
        });

        // Reply to an email
        replay_btn.addEventListener('click', function () {
          email_reply(email)
        });
      }
    })
    .catch(error => console.log('Email error', error));

}

function email_read(email_id) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function email_archive(email_id, state) {
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: state
    })
  })
}

function email_reply(email) {
  compose_email();
  if (!/^Re:/.test(email.subject)) email.subject = `Re: ${email.subject}`;
  document.querySelector("#compose-recipients").value = email.sender;
  document.querySelector("#compose-subject").value = email.subject;
  document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote:\n${email.body}\n`;
}