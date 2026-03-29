/*
Author: Nozhin Azarpanah
Date: March 29, 2026
Server-side Assignment
*/

window.addEventListener("load", function () {
    const form = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const birthdayInput = document.getElementById("birthday");
    const nicknameInput = document.getElementById("nickname");
    const error = document.getElementById("error");

    /**
     * Validates if an email address has a proper format.
     * @param {string} email - The email address to validate.
     * @returns {boolean} True if email is valid, false otherwise.
     */
    function validateEmail(email) {
        const atIndex = email.indexOf("@");
        const dotIndex = email.lastIndexOf(".");

        return !(
            atIndex <= 0 ||
            dotIndex <= atIndex + 1 ||
            dotIndex === email.length - 1
        );
    }

    /**
     * Validates if a birthday date is valid and not in the future.
     * @param {string} birthday - The birthday date in string format.
     * @returns {boolean} True if birthday is valid, false otherwise.
     */
    function validateBirthday(birthday) {
        const date = new Date(birthday);

        if (isNaN(date.getTime())) {
            return false;
        }

        const today = new Date();
        if (date > today) {
            return false;
        }

        return true;
    }

    /**
     * Validates if a nickname is not empty.
     * @param {string} nickname - The nickname to validate.
     * @returns {boolean} True if nickname is not empty, false otherwise.
     */
    function validateNickname(nickname) {
        return nickname.trim() !== "";
    }

    form.addEventListener("submit", function (event) {
        const email = emailInput ? emailInput.value.trim() : "";
        const birthday = birthdayInput ? birthdayInput.value : "";
        const nickname = nicknameInput ? nicknameInput.value.trim() : "";

        if (emailInput && email === "") {
            error.textContent = "Please enter your email address.";
            event.preventDefault();
            return;
        }

        if (birthdayInput && birthday === "") {
            error.textContent = "Please enter your birthday.";
            event.preventDefault();
            return;
        }

        if (emailInput && !validateEmail(email)) {
            error.textContent = "Enter a valid email like a@b.c";
            event.preventDefault();
            return;
        }

        if (birthdayInput && !validateBirthday(birthday)) {
            error.textContent = "Enter a valid birthday.";
            event.preventDefault();
            return;
        }

        if (nicknameInput && !validateNickname(nickname)) {
            error.textContent = "Please enter your nickname.";
            event.preventDefault();
            return;
        }

        error.textContent = "";
    });
});