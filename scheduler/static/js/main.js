document.addEventListener('DOMContentLoaded', function() {
  // Registration form logic
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const emailMessageDiv = document.getElementById('email-message');
    const passwordMatchDiv = document.getElementById('password-match-message');
    const registerButton = document.getElementById('registerButton');
    
    const reqLength = document.getElementById('req-length');
    const reqUpper = document.getElementById('req-uppercase');
    const reqLower = document.getElementById('req-lowercase');
    const reqDigit = document.getElementById('req-digit');
    const reqSpecial = document.getElementById('req-special');
    
    const togglePassword = document.getElementById('togglePassword');
    
    let emailValid = false;
    let passwordValid = false;
    let passwordsMatch = false;
    
    const regexLength = /.{8,}/;
    const regexUpper = /[A-Z]/;
    const regexLower = /[a-z]/;
    const regexDigit = /\d/;
    const regexSpecial = /[@$!%*?&]/;
    
    function updateRegisterButton() {
      registerButton.disabled = !(emailValid && passwordValid && passwordsMatch);
    }
    
    function checkPasswordCriteria() {
      const password = passwordInput.value;
      let valid = true;
      
      if (regexLength.test(password)) {
        reqLength.textContent = '✓ At least 8 characters';
        reqLength.style.color = 'green';
      } else {
        reqLength.textContent = '✗ At least 8 characters';
        reqLength.style.color = 'red';
        valid = false;
      }
      
      if (regexUpper.test(password)) {
        reqUpper.textContent = '✓ At least one uppercase letter';
        reqUpper.style.color = 'green';
      } else {
        reqUpper.textContent = '✗ At least one uppercase letter';
        reqUpper.style.color = 'red';
        valid = false;
      }
      
      if (regexLower.test(password)) {
        reqLower.textContent = '✓ At least one lowercase letter';
        reqLower.style.color = 'green';
      } else {
        reqLower.textContent = '✗ At least one lowercase letter';
        reqLower.style.color = 'red';
        valid = false;
      }
      
      if (regexDigit.test(password)) {
        reqDigit.textContent = '✓ At least one digit';
        reqDigit.style.color = 'green';
      } else {
        reqDigit.textContent = '✗ At least one digit';
        reqDigit.style.color = 'red';
        valid = false;
      }
      
      if (regexSpecial.test(password)) {
        reqSpecial.textContent = '✓ At least one special character (@$!%*?&)';
        reqSpecial.style.color = 'green';
      } else {
        reqSpecial.textContent = '✗ At least one special character (@$!%*?&)';
        reqSpecial.style.color = 'red';
        valid = false;
      }
      
      passwordValid = valid;
      updateRegisterButton();
    }
    
    function checkPasswordsMatch() {
      if (passwordInput.value === confirmPasswordInput.value && passwordInput.value !== "") {
        passwordMatchDiv.textContent = 'Passwords match';
        passwordMatchDiv.style.color = 'green';
        passwordsMatch = true;
      } else {
        passwordMatchDiv.textContent = 'Passwords do not match';
        passwordMatchDiv.style.color = 'red';
        passwordsMatch = false;
      }
      updateRegisterButton();
    }
    
    function checkEmailUniqueness() {
      const email = emailInput.value.trim();
      if (!email) {
        emailMessageDiv.textContent = '';
        emailValid = false;
        updateRegisterButton();
        return;
      }
      
      fetch(`/api/check_email/?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
          if (data.exists) {
            emailMessageDiv.textContent = 'Email is already taken';
            emailMessageDiv.style.color = 'red';
            emailValid = false;
          } else {
            emailMessageDiv.textContent = 'Email is available';
            emailMessageDiv.style.color = 'green';
            emailValid = true;
          }
          updateRegisterButton();
        })
        .catch(error => {
          console.error('Error checking email uniqueness:', error);
          emailMessageDiv.textContent = '';
          emailValid = false;
          updateRegisterButton();
        });
    }
    
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      confirmPasswordInput.setAttribute('type', type);
      this.textContent = type === 'password' ? '👁' : '👁‍🗨';
    });
    
    passwordInput.addEventListener('keyup', function() {
      checkPasswordCriteria();
      checkPasswordsMatch();
    });
    
    confirmPasswordInput.addEventListener('keyup', checkPasswordsMatch);
    emailInput.addEventListener('blur', checkEmailUniqueness);
    
    registerForm.addEventListener('submit', function(event) {
      if (!confirm("Proceed with registration and 2FA setup?")) {
        event.preventDefault();
      }
    });
  }
});
