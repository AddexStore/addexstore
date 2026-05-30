package com.addexstores.validation;

import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = Password.PasswordConstraintValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface Password {

    String message() default "Password must be 8-50 characters with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special character";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    class PasswordConstraintValidator implements ConstraintValidator<Password, String> {

        private static final String PASSWORD_PATTERN =
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,50}$";

        @Override
        public void initialize(Password constraintAnnotation) {
        }

        @Override
        public boolean isValid(String password, ConstraintValidatorContext context) {
            if (password == null) {
                return false;
            }
            return password.matches(PASSWORD_PATTERN);
        }
    }
}
