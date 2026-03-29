/*
Author: Nozhin Azarpanah
Date: March 14, 2026
Server-side Assignment
*/

window.addEventListener("load", function () {
    const form = document.querySelector("form");
    const emailInput = document.getElementById("email");
    const birthdayInput = document.getElementById("birthday");
    const error = document.getElementById("error");

    function validateEmail(email) {
        const atIndex = email.indexOf("@");
        const dotIndex = email.lastIndexOf(".");

        return !(
            atIndex <= 0 ||
            dotIndex <= atIndex + 1 ||
            dotIndex === email.length - 1
        );
    }

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

    form.addEventListener("submit", function (event) {
        const email = emailInput.value.trim();
        const birthday = birthdayInput.value;

        if (email === "") {
            error.textContent = "Please enter your email address.";
            event.preventDefault();
            return;
        }

        if (birthday === "") {
            error.textContent = "Please enter your birthday.";
            event.preventDefault();
            return;
        }

        if (!validateEmail(email)) {
            error.textContent = "Enter a valid email like a@b.c";
            event.preventDefault();
            return;
        }

        if (!validateBirthday(birthday)) {
            error.textContent = "Enter a valid birthday.";
            event.preventDefault();
            return;
        }

        error.textContent = "";
    });
});