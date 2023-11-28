// Display/hide sign up modal
const signUpModal = document.getElementById("sign_up");

const signUpButton = document.getElementById('sign_up_btn');

if (signUpButton) {
  signUpButton.onclick = () => {
    signUpModal.style.display = "block";
  }
  
  window.onclick = (event) => {
    if (event.target == signUpModal) {
      signUpModal.style.display = "none";
    }
  }
}

// Display/hide sign in modal
const signInModal = document.getElementById("sign_in");

const signInButton = document.getElementById('sign_in_btn');

if (signInButton) {
  signInButton.onclick = () => {
    signInModal.style.display = "block";
  }
  
  // Closing modals when clicked outside of the modal
  window.onclick = (event) => {
    if (event.target == signUpModal) {
      signUpModal.style.display = "none";
    } else if (event.target == signInModal) {
      signInModal.style.display = "none";
    }
  }
}

document.getElementById('sign_up_form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const formData = new URLSearchParams(new FormData(this));

  try {
    const response = await fetch('/sign-up', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const data = await response.json();

    if (data.success) {
      window.location.href = '/'; 
    } else {
      const prevErrors = document.getElementById('sign_up_errors');
      
      if (prevErrors) {
        prevErrors.remove();
      }

      const signUpForm = document.getElementById('sign_up_form');
      const errorsDiv = document.createElement("ul");
      errorsDiv.id = 'sign_up_errors';

      for (let i = 0; i < data.errors.length; i++) {
        const errorElement = document.createElement("li");
        errorElement.innerText = data.errors[i].msg;

        errorsDiv.appendChild(errorElement);
      }

      signUpForm.appendChild(errorsDiv);
    }
  } catch (error) {
    return(error);
  }
});

