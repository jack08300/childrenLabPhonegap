/**
 * Created by Jay on 4/2/2015.
 */
var Signup = function(){
    var self = this;
    $(document).ready(function(){
        self.init();
    });

};

Signup.prototype.init = function(){

    this.signUpUrl = "http://www.childrenLab.com/user/register";
    this.$email = $('input[name="email"]');
    this.$password = $('input[name="password"]');
    this.$firstName = $('input[name="firstName"]');
    this.$lastName = $('input[name="lastName"]');
    this.$phoneNumber = $('input[name="phoneNumber"]');
    this.$gender = $('input[name="sex"]:checked');
    this.$errorMessage = $('div.errorMessage');
    this.$button = $('div.signUpButton');

    this.attachEvent();
};

Signup.prototype.attachEvent = function(){
    var self = this;
    this.$button.on('click', function(){
        self.submitForm();
    });
};

Signup.prototype.submitForm = function(){
    this.$errorMessage.text("");

    if(!app.validateEmail(this.$email.val())){
        this.$errorMessage.text("Please check your email format.");
        return;
    }

    if(!app.validatePassword(this.$password.val())){
        this.$errorMessage.text("Please check your password format.");
        return;
    }

    if(!this.$firstName.val() || !this.$lastName.val()){
        this.$errorMessage.text("Please check your name.");
        return;
    }

    if(this.$gender.val()){
        this.$errorMessage.text("Please select your gender.");
        return;
    }

    if(this.$phoneNumber.val().length < 5){
        this.$errorMessage.text("Please enter your phone number.");
        return;
    }
    app.ajax({
        url: this.signUpUrl,
        context: this,
        data: {
            email: this.$email.val(),
            password: this.$password.val(),
            firstName: this.$firstName.val(),
            lastName: this.$lastName.val(),
            phoneNumber: this.$phoneNumber.val()
        },
        callback: this.submitForm_load
    });
};

Signup.prototype.submitForm_load = function(data){
    if(data.success){
        app.signIn({
            email: this.$email.val(),
            password: this.$password.val()
        });
    }else{
        this.$errorMessage.text(data.message);
    }

};

new Signup();