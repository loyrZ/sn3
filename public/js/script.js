document.addEventListener("DOMContentLoaded", function() {
    var registrationForm = document.forms["registrationForm"];
    var usernameInput = document.getElementById("username");
    var errorMessage = document.getElementById("error-box");

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";

        setTimeout(function() {
            errorMessage.style.display = "none";
        }, 3000);
    }

    registrationForm.addEventListener("submit", function(event) {
        console.log("Form submitted!");
        errorMessage.textContent = "";

        var username = usernameInput.value;
        var usernamePattern = /^[a-zA-Z][a-zA-Z0-9]{2,}$/;
        if (!usernamePattern.test(username)) {
            showError("Username has to start with an alphabet and have at least 3 characters.");
            event.preventDefault();
            return;
        }

        var passwordInput = document.getElementById("password");
        var password = passwordInput.value;
        var passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
        if (!passwordPattern.test(password)) {
            showError("Password needs at least 8 characters, 1 uppercase letter, 1 number, and 1 special character.");
            event.preventDefault();
            return;
        }

        var confirmPasswordInput = document.getElementById("confirm_password");
        var confirmPassword = confirmPasswordInput.value;
        if (password !== confirmPassword) {
            showError("Passwords do not match.");
            event.preventDefault();
            return;
        }

        alert("Registration successful!");
    });

});
