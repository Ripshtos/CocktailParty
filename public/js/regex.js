$(document).ready(function() {
    $("form").submit(function(e) {
      var fname = $("#fname").val();
      var lname = $("#lname").val();
      var address = $("#address").val();
      var postal = $("#postal").val();
      var email = $("#email").val();
      var phone = $("#phone").val();
      var password = $("#password").val();
      
      // Regex patterns for validation
      var nameRegex = /^[a-zA-Zא-ת\s]+$/;
      var addressRegex = /^[a-zA-Z0-9א-ת\s,'-]*$/;
      var postalRegex = /^\d{7}$/;
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      var phoneRegex = /^\d{10}$/;
      var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  
      if (!nameRegex.test(fname)) {
        alert("אנא הזן שם פרטי תקין");
        e.preventDefault();
      }
  
      if (!nameRegex.test(lname)) {
        alert("אנא הזן שם משפחה תקין");
        e.preventDefault();
      }
  
      if (!addressRegex.test(address)) {
        alert("אנא הזן כתובת תקינה");
        e.preventDefault();
      }
  
      if (!postalRegex.test(postal)) {
        alert("אנא הזן מיקוד תקין");
        e.preventDefault();
      }
  
      if (!emailRegex.test(email)) {
        alert("אנא הזן כתובת אימייל תקינה");
        e.preventDefault();
      }
  
      if (!phoneRegex.test(phone)) {
        alert("אנא הזן מספר טלפון תקין");
        e.preventDefault();
      }
  
      if (!passwordRegex.test(password)) {
        alert("אנא הזן סיסמה תקינה (מינימום 8 תווים, לפחות אות אחת וספרה אחת)");
        e.preventDefault();
      }
    });
  });
  