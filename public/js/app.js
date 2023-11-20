// Display/hide sign up modal
const signUpModal = document.getElementById("sign_up");

const signUpButton = document.getElementById('sign_up_btn');

signUpButton.onclick = () => {
  signUpModal.style.display = "block";
}

window.onclick = (event) => {
  if (event.target == signUpModal) {
    signUpModal.style.display = "none";
  }
}

// Display/hide sign in modal
const signInModal = document.getElementById("sign_in");

const signInButton = document.getElementById('sign_in_btn');

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


